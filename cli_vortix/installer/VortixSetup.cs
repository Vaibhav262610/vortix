using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Pipes;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace VortixSetup
{
    internal static class Program
    {
        private const string Version = "1.2.14";

        [STAThread]
        private static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SetupForm());
        }

        private sealed class SetupForm : Form
        {
            private readonly Label status;
            private readonly Button installButton;
            private readonly string nodePath;
            private readonly string npmPath;

            internal SetupForm()
            {
                Text = "Vortix for Windows";
                ClientSize = new Size(440, 320);
                FormBorderStyle = FormBorderStyle.FixedDialog;
                MaximizeBox = false;
                StartPosition = FormStartPosition.CenterScreen;
                BackColor = Color.FromArgb(9, 17, 17);
                ForeColor = Color.White;
                Font = new Font("Segoe UI", 9);
                Icon = new Icon(Assembly.GetExecutingAssembly().GetManifestResourceStream("VortixIcon"));

                var eyebrow = new Label { Text = "VORTIX  /  WINDOWS AGENT", ForeColor = Color.FromArgb(80, 220, 160), Font = new Font("Segoe UI Semibold", 9, FontStyle.Bold) };
                eyebrow.SetBounds(24, 22, 380, 22);
                Controls.Add(eyebrow);

                var title = new Label { Text = "Connect this computer.", ForeColor = Color.White, Font = new Font("Segoe UI Semibold", 22, FontStyle.Bold) };
                title.SetBounds(22, 53, 400, 43);
                Controls.Add(title);

                var description = new Label {
                    Text = "Install Vortix " + Version + " and keep it available from the system tray. The agent connects to the same Vortix cloud backend as your other devices.",
                    ForeColor = Color.FromArgb(162, 183, 174)
                };
                description.SetBounds(24, 108, 390, 61);
                Controls.Add(description);

                nodePath = FindExecutable("node.exe");
                npmPath = FindExecutable("npm.cmd");
                var requirement = new Label {
                    Text = nodePath != null && npmPath != null ? "Node.js detected. Ready to install." : "Node.js is required before installing Vortix.",
                    ForeColor = nodePath != null && npmPath != null ? Color.FromArgb(80, 220, 160) : Color.FromArgb(245, 183, 83)
                };
                requirement.SetBounds(24, 181, 390, 24);
                Controls.Add(requirement);

                var nodeLink = new LinkLabel { Text = "Get Node.js", LinkColor = Color.FromArgb(80, 220, 160), ActiveLinkColor = Color.White };
                nodeLink.SetBounds(24, 210, 130, 25);
                nodeLink.LinkClicked += delegate { Process.Start("https://nodejs.org/en/download"); };
                Controls.Add(nodeLink);

                installButton = new Button { Text = "Install Vortix", Enabled = nodePath != null && npmPath != null, FlatStyle = FlatStyle.Flat,
                    BackColor = Color.FromArgb(39, 151, 101), ForeColor = Color.White, Font = new Font("Segoe UI Semibold", 10, FontStyle.Bold) };
                installButton.FlatAppearance.BorderSize = 0;
                installButton.SetBounds(24, 247, 392, 42);
                installButton.Click += async delegate
                {
                    installButton.Enabled = false;
                    try
                    {
                        await Task.Run(() => Install());
                        SetStatus("Installed. Set the device password in the tray window.");
                        installButton.Text = "Installed";
                    }
                    catch (Exception error)
                    {
                        SetStatus("Installation failed. See the error details.");
                        MessageBox.Show(this, error.Message, "Vortix setup", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        installButton.Enabled = true;
                    }
                };
                Controls.Add(installButton);

                status = new Label { Text = "Installs for this Windows user. No terminal needed.", ForeColor = Color.FromArgb(132, 155, 147) };
                status.SetBounds(24, 297, 392, 21);
                Controls.Add(status);
            }

            private void SetStatus(string message)
            {
                if (IsDisposed) return;
                if (InvokeRequired) { BeginInvoke((Action)(() => SetStatus(message))); return; }
                status.Text = message;
            }

            private void Install()
            {
                string tempFolder = Path.Combine(Path.GetTempPath(), "VortixSetup-" + Guid.NewGuid().ToString("N"));
                Directory.CreateDirectory(tempFolder);
                string archive = Path.Combine(tempFolder, "vortix-" + Version + ".tgz");
                try
                {
                    SetStatus("Preparing Vortix " + Version + "…");
                    using (var source = Assembly.GetExecutingAssembly().GetManifestResourceStream("VortixPackage"))
                    {
                        if (source == null) throw new Exception("The bundled agent package is missing.");
                        using (var destination = File.Create(archive)) source.CopyTo(destination);
                    }

                    string globalRoot = RunNpm("root -g", 60000).Trim().Split('\n').Last().Trim();
                    StopPreviousVersion(globalRoot);
                    SetStatus("Installing the device agent…");
                    RunNpm("install -g \"" + archive + "\" --no-fund", 300000);
                    string agent = Path.Combine(globalRoot, "vortix", "agent", "agent.js");
                    string tray = Path.Combine(globalRoot, "vortix", "tray", "VortixTray.exe");
                    if (!File.Exists(agent) || !File.Exists(tray)) throw new Exception("Vortix files were not installed.");

                    SetStatus("Enabling startup at Windows sign-in…");
                    Run(nodePath, "\"" + agent + "\" enable-autostart", 60000);
                    string pipeName = "vortix-agent-" + UserKey();
                    var trayStart = new ProcessStartInfo(tray, "\"" + agent + "\" \"" + nodePath + "\" \"" + pipeName + "\" \"" + Version + "\" --show");
                    trayStart.UseShellExecute = true;
                    Process.Start(trayStart);
                }
                finally
                {
                    try { Directory.Delete(tempFolder, true); } catch { }
                }
            }

            private void StopPreviousVersion(string globalRoot)
            {
                string pipe = "vortix-agent-" + UserKey();
                try
                {
                    using (var signal = EventWaitHandle.OpenExisting("Local\\VortixTrayExit-" + pipe)) signal.Set();
                    Thread.Sleep(1000);
                }
                catch (WaitHandleCannotBeOpenedException) { }
                string installedTray = Path.GetFullPath(Path.Combine(globalRoot, "vortix", "tray", "VortixTray.exe"));
                foreach (Process candidate in Process.GetProcessesByName("VortixTray"))
                {
                    using (candidate)
                    {
                        try
                        {
                            if (!string.Equals(Path.GetFullPath(candidate.MainModule.FileName), installedTray, StringComparison.OrdinalIgnoreCase)) continue;
                            if (!candidate.WaitForExit(2000)) { candidate.Kill(); candidate.WaitForExit(5000); }
                        }
                        catch (System.ComponentModel.Win32Exception) { }
                        catch (InvalidOperationException) { }
                    }
                }
                try
                {
                    using (var client = new NamedPipeClientStream(".", pipe, PipeDirection.Out))
                    {
                        client.Connect(250);
                        using (var writer = new StreamWriter(client, new UTF8Encoding(false)))
                        {
                            writer.NewLine = "\n";
                            writer.WriteLine("quit");
                        }
                    }
                    Thread.Sleep(300);
                }
                catch (TimeoutException) { }
                catch (IOException) { }
            }

            private string RunNpm(string arguments, int timeout)
            {
                string command = "/d /s /c \"\"" + npmPath + "\" " + arguments + "\"";
                return Run(Environment.GetEnvironmentVariable("ComSpec") ?? "cmd.exe", command, timeout);
            }

            private static string Run(string executable, string arguments, int timeout)
            {
                var info = new ProcessStartInfo(executable, arguments) {
                    UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true
                };
                var output = new StringBuilder();
                using (var process = new Process { StartInfo = info })
                {
                    process.OutputDataReceived += delegate(object sender, DataReceivedEventArgs e) { if (e.Data != null) lock (output) output.AppendLine(e.Data); };
                    process.ErrorDataReceived += delegate(object sender, DataReceivedEventArgs e) { if (e.Data != null) lock (output) output.AppendLine(e.Data); };
                    process.Start();
                    process.BeginOutputReadLine();
                    process.BeginErrorReadLine();
                    if (!process.WaitForExit(timeout)) { process.Kill(); throw new Exception("Timed out while running " + Path.GetFileName(executable) + " " + arguments + "."); }
                    process.WaitForExit();
                    string result = output.ToString();
                    if (process.ExitCode != 0) throw new Exception("Command failed: " + LastLine(result));
                    return result;
                }
            }

            private static string LastLine(string output)
            {
                string[] lines = output.Trim().Split('\n');
                return lines.Length > 0 ? lines[lines.Length - 1].Trim() : "unknown error";
            }

            private static string FindExecutable(string name)
            {
                string path = Environment.GetEnvironmentVariable("PATH") ?? "";
                string programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
                foreach (string folder in path.Split(';').Concat(new[] { Path.Combine(programFiles, "nodejs") }))
                {
                    try
                    {
                        string candidate = Path.Combine(folder.Trim().Trim('"'), name);
                        if (File.Exists(candidate)) return candidate;
                    }
                    catch (ArgumentException) { }
                }
                return null;
            }

            private static string UserKey()
            {
                string home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile).ToLowerInvariant();
                using (var sha = SHA256.Create())
                {
                    byte[] bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(home));
                    return BitConverter.ToString(bytes).Replace("-", "").ToLowerInvariant().Substring(0, 16);
                }
            }
        }
    }
}
