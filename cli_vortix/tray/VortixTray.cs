using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.IO.Pipes;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Windows.Forms;

namespace VortixTray
{
    internal static class Program
    {
        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        private static extern IntPtr FindWindow(string className, string windowName);
        [DllImport("user32.dll")]
        private static extern bool ShowWindow(IntPtr handle, int command);
        [DllImport("user32.dll")]
        private static extern bool SetForegroundWindow(IntPtr handle);

        [STAThread]
        private static void Main(string[] args)
        {
            if (args.Length < 4) return;
            bool show = args.Length > 4 && args[4] == "--show";
            bool created;
            using (var mutex = new System.Threading.Mutex(true, "Local\\VortixTray-" + args[2], out created))
            {
                if (!created)
                {
                    if (show)
                    {
                        try
                        {
                            using (var signal = System.Threading.EventWaitHandle.OpenExisting("Local\\VortixTrayShow-" + args[2]))
                                signal.Set();
                        }
                        catch (System.Threading.WaitHandleCannotBeOpenedException) { }
                        IntPtr existing = FindWindow(null, "Vortix Device");
                        if (existing != IntPtr.Zero)
                        {
                            ShowWindow(existing, 9);
                            SetForegroundWindow(existing);
                        }
                    }
                    return;
                }
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                using (var app = new TrayContext(args[0], args[1], args[2], args[3], show))
                    Application.Run(app);
                mutex.ReleaseMutex();
            }
        }
    }

    internal sealed class TrayContext : ApplicationContext
    {
        private readonly string agentPath;
        private readonly string nodePath;
        private readonly string pipeName;
        private readonly NotifyIcon notify;
        private readonly Form window;
        private readonly Label stateLabel;
        private readonly Label detailLabel;
        private readonly Button actionButton;
        private readonly ToolStripMenuItem pauseItem;
        private readonly ToolStripMenuItem startItem;
        private readonly Timer timer;
        private readonly System.Threading.EventWaitHandle showSignal;
        private string state = "starting";
        private bool exiting;

        [DllImport("user32.dll")]
        private static extern bool DestroyIcon(IntPtr handle);

        internal TrayContext(string agent, string node, string pipe, string version, bool show)
        {
            agentPath = agent;
            nodePath = node;
            pipeName = pipe;
            showSignal = new System.Threading.EventWaitHandle(false,
                System.Threading.EventResetMode.AutoReset, "Local\\VortixTrayShow-" + pipe);

            window = new Form();
            window.Text = "Vortix Device";
            window.ClientSize = new Size(392, 296);
            window.FormBorderStyle = FormBorderStyle.FixedSingle;
            window.MaximizeBox = false;
            window.MinimizeBox = false;
            window.StartPosition = FormStartPosition.CenterScreen;
            window.ShowInTaskbar = false;
            window.BackColor = Color.FromArgb(9, 17, 17);
            window.ForeColor = Color.White;
            window.Font = new Font("Segoe UI", 10);
            window.FormClosing += delegate(object sender, FormClosingEventArgs e)
            {
                if (!exiting) { e.Cancel = true; window.Hide(); }
            };

            var brand = new Label();
            brand.Text = "VORTIX";
            brand.ForeColor = Color.FromArgb(80, 220, 160);
            brand.Font = new Font("Segoe UI Semibold", 13, FontStyle.Bold);
            brand.SetBounds(24, 21, 230, 30);
            window.Controls.Add(brand);

            var versionLabel = new Label();
            versionLabel.Text = "AGENT  " + version;
            versionLabel.ForeColor = Color.FromArgb(132, 155, 147);
            versionLabel.Font = new Font("Segoe UI", 8);
            versionLabel.TextAlign = ContentAlignment.MiddleRight;
            versionLabel.SetBounds(235, 22, 130, 25);
            window.Controls.Add(versionLabel);

            var deviceLabel = new Label();
            deviceLabel.Text = Environment.MachineName;
            deviceLabel.ForeColor = Color.FromArgb(174, 193, 184);
            deviceLabel.Font = new Font("Segoe UI", 9);
            deviceLabel.SetBounds(25, 58, 340, 24);
            window.Controls.Add(deviceLabel);

            var card = new Panel();
            card.BackColor = Color.FromArgb(18, 30, 28);
            card.SetBounds(22, 94, 348, 106);
            window.Controls.Add(card);

            stateLabel = new Label();
            stateLabel.Text = "●  STARTING";
            stateLabel.ForeColor = Color.FromArgb(245, 183, 83);
            stateLabel.Font = new Font("Segoe UI Semibold", 16, FontStyle.Bold);
            stateLabel.SetBounds(18, 15, 310, 37);
            card.Controls.Add(stateLabel);

            detailLabel = new Label();
            detailLabel.Text = "Checking the device agent…";
            detailLabel.ForeColor = Color.FromArgb(162, 183, 174);
            detailLabel.Font = new Font("Segoe UI", 9);
            detailLabel.SetBounds(20, 61, 310, 26);
            card.Controls.Add(detailLabel);

            var dashboardButton = MakeButton("Open dashboard", 22, 220, 164, true);
            dashboardButton.Click += delegate { OpenDashboard(); };
            window.Controls.Add(dashboardButton);

            actionButton = MakeButton("Pause agent", 196, 220, 174, false);
            actionButton.Click += delegate { ToggleAgent(); };
            window.Controls.Add(actionButton);

            var hint = new Label();
            hint.Text = "Closing this window keeps Vortix in the tray.";
            hint.ForeColor = Color.FromArgb(112, 137, 125);
            hint.Font = new Font("Segoe UI", 8);
            hint.SetBounds(25, 266, 340, 20);
            window.Controls.Add(hint);

            var menu = new ContextMenuStrip();
            menu.BackColor = Color.FromArgb(24, 35, 33);
            menu.ForeColor = Color.White;
            menu.Items.Add("Show status", null, delegate { ShowStatus(); });
            menu.Items.Add("Open dashboard", null, delegate { OpenDashboard(); });
            menu.Items.Add(new ToolStripSeparator());
            pauseItem = new ToolStripMenuItem("Pause agent");
            pauseItem.Click += delegate { ToggleAgent(); };
            menu.Items.Add(pauseItem);
            startItem = new ToolStripMenuItem("Start agent");
            startItem.Click += delegate { StartAgent(); };
            menu.Items.Add(startItem);
            menu.Items.Add(new ToolStripSeparator());
            menu.Items.Add("Quit Vortix", null, delegate { Quit(); });

            notify = new NotifyIcon();
            notify.Text = "Vortix — starting";
            notify.Icon = MakeIcon(Color.FromArgb(245, 183, 83));
            notify.ContextMenuStrip = menu;
            notify.DoubleClick += delegate { ShowStatus(); };
            notify.Visible = true;

            MainForm = window;
            IntPtr unused = window.Handle;
            if (show) ShowStatus();
            if (ReadAgent("status") == null) StartAgent();
            Poll();
            timer = new Timer();
            timer.Interval = 3000;
            timer.Tick += delegate
            {
                if (showSignal.WaitOne(0)) ShowStatus();
                Poll();
            };
            timer.Start();
        }

        private static Button MakeButton(string text, int x, int y, int width, bool primary)
        {
            var button = new Button();
            button.Text = text;
            button.SetBounds(x, y, width, 37);
            button.FlatStyle = FlatStyle.Flat;
            button.FlatAppearance.BorderSize = primary ? 0 : 1;
            button.FlatAppearance.BorderColor = Color.FromArgb(70, 98, 83);
            button.BackColor = primary ? Color.FromArgb(39, 151, 101) : Color.FromArgb(27, 42, 36);
            button.ForeColor = Color.White;
            button.Font = new Font("Segoe UI Semibold", 9, FontStyle.Bold);
            button.Cursor = Cursors.Hand;
            return button;
        }

        private static Icon MakeIcon(Color accent)
        {
            using (var bitmap = new Bitmap(32, 32))
            using (var graphics = Graphics.FromImage(bitmap))
            {
                graphics.SmoothingMode = SmoothingMode.AntiAlias;
                graphics.Clear(Color.Transparent);
                using (var background = new SolidBrush(Color.FromArgb(12, 25, 22)))
                    graphics.FillEllipse(background, 1, 1, 30, 30);
                using (var border = new Pen(accent, 2))
                    graphics.DrawEllipse(border, 2, 2, 28, 28);
                using (var pen = new Pen(accent, 3.5f))
                    graphics.DrawLines(pen, new[] { new Point(8, 10), new Point(16, 23), new Point(24, 10) });
                IntPtr handle = bitmap.GetHicon();
                try { return (Icon)Icon.FromHandle(handle).Clone(); }
                finally { DestroyIcon(handle); }
            }
        }

        private string ReadAgent(string action)
        {
            try
            {
                using (var pipe = new NamedPipeClientStream(".", pipeName, PipeDirection.InOut))
                {
                    pipe.Connect(250);
                    using (var reader = new StreamReader(pipe))
                    using (var writer = new StreamWriter(pipe, new UTF8Encoding(false)))
                    {
                        writer.AutoFlush = true;
                        writer.NewLine = "\n";
                        writer.WriteLine(action);
                        return reader.ReadLine();
                    }
                }
            }
            catch { return null; }
        }

        private static string Field(string json, string name)
        {
            if (json == null) return null;
            Match match = Regex.Match(json, "\"" + name + "\"\\s*:\\s*\"([^\"]*)\"");
            return match.Success ? match.Groups[1].Value : null;
        }

        private void Poll()
        {
            string response = ReadAgent("status");
            string next = Field(response, "state") ?? "stopped";
            if (next == state) return;
            state = next;
            Color accent = state == "online" ? Color.FromArgb(80, 220, 160)
                : state == "paused" ? Color.FromArgb(245, 183, 83)
                : Color.FromArgb(245, 110, 100);
            stateLabel.Text = "●  " + state.ToUpperInvariant();
            stateLabel.ForeColor = accent;
            detailLabel.Text = state == "online" ? "Connected to the Vortix backend"
                : state == "paused" ? "Remote control is paused"
                : state == "connecting" ? "Connecting to the backend…"
                : state == "stopped" ? "The device agent is not running"
                : "Reconnecting to the backend…";
            pauseItem.Text = state == "paused" ? "Resume agent" : "Pause agent";
            pauseItem.Enabled = state != "stopped";
            startItem.Visible = state == "stopped";
            actionButton.Text = state == "paused" ? "Resume agent"
                : state == "stopped" ? "Start agent" : "Pause agent";
            notify.Text = "Vortix — " + state;
            Icon previous = notify.Icon;
            notify.Icon = MakeIcon(accent);
            if (previous != null) previous.Dispose();
        }

        private void ToggleAgent()
        {
            if (state == "stopped") StartAgent();
            else ReadAgent(state == "paused" ? "resume" : "pause");
            Poll();
        }

        private void StartAgent()
        {
            try
            {
                var start = new ProcessStartInfo();
                start.FileName = nodePath;
                start.Arguments = "\"" + agentPath + "\" start";
                start.UseShellExecute = false;
                start.CreateNoWindow = true;
                start.WindowStyle = ProcessWindowStyle.Hidden;
                Process.Start(start);
                stateLabel.Text = "●  STARTING";
                detailLabel.Text = "Starting the device agent…";
            }
            catch (Exception error)
            {
                detailLabel.Text = "Could not start agent: " + error.Message;
            }
        }

        private void ShowStatus()
        {
            window.Show();
            window.WindowState = FormWindowState.Normal;
            window.BringToFront();
            window.Activate();
        }

        private static void OpenDashboard()
        {
            try { Process.Start("https://vortixai.vercel.app/dashboard"); }
            catch { MessageBox.Show("Open https://vortixai.vercel.app/dashboard", "Vortix"); }
        }

        private void Quit()
        {
            ReadAgent("quit");
            exiting = true;
            timer.Stop();
            notify.Visible = false;
            notify.Dispose();
            window.Close();
            ExitThread();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (timer != null) timer.Dispose();
                if (showSignal != null) showSignal.Dispose();
                if (notify != null) notify.Dispose();
                if (window != null) window.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
