export const quickCommands = [
	{
		category: "Applications",
		commands: [
			{ name: "Notepad", icon: "document-text", command: "start notepad", description: "Open Notepad" },
			{ name: "Calculator", icon: "calculator", command: "start calc", description: "Open Calculator" },
			{ name: "Task Manager", icon: "chart-bar", command: "start taskmgr", description: "Open Task Manager" },
			{ name: "Command Prompt", icon: "terminal", command: "start cmd", description: "Open CMD" },
			{ name: "PowerShell", icon: "code-bracket", command: "start powershell", description: "Open PowerShell" },
			{ name: "Paint", icon: "paint-brush", command: "start mspaint", description: "Open Paint" },
			{ name: "File Explorer", icon: "folder-open", command: "start explorer", description: "Open File Explorer" },
			{ name: "Control Panel", icon: "cog-6-tooth", command: "start control", description: "Open Control Panel" },
			{ name: "Settings", icon: "adjustments-horizontal", command: "start ms-settings:", description: "Open Windows Settings" },
		],
	},
	{
		category: "System Info",
		commands: [
			{ name: "System Info", icon: "computer-desktop", command: "systeminfo", description: "Display system information" },
			{ name: "IP Config", icon: "globe-alt", command: "ipconfig /all", description: "Display network configuration" },
			{ name: "Task List", icon: "list-bullet", command: "tasklist", description: "List running processes" },
			{ name: "Disk Info", icon: "circle-stack", command: "wmic logicaldisk get name,size,freespace", description: "Show disk space" },
			{ name: "Battery Status", icon: "battery-50", command: "WMIC Path Win32_Battery Get EstimatedChargeRemaining", description: "Check battery level" },
			{ name: "CPU Info", icon: "cpu-chip", command: "wmic cpu get name,maxclockspeed,numberofcores", description: "Display CPU details" },
			{ name: "RAM Info", icon: "server", command: "wmic memorychip get capacity,speed", description: "Display RAM details" },
			{ name: "OS Version", icon: "window", command: "ver", description: "Show Windows version" },
		],
	},
	{
		category: "Network",
		commands: [
			{ name: "Ping Google", icon: "signal", command: "ping google.com -n 4", description: "Test internet connection" },
			{ name: "Network Stats", icon: "chart-bar-square", command: "netstat -an", description: "Show network statistics" },
			{ name: "DNS Flush", icon: "arrow-path", command: "ipconfig /flushdns", description: "Clear DNS cache" },
			{ name: "Trace Route", icon: "map", command: "tracert google.com", description: "Trace route to Google" },
			{ name: "WiFi Passwords", icon: "key", command: "netsh wlan show profiles", description: "Show saved WiFi networks" },
			{ name: "Active Connections", icon: "link", command: "netstat -ano", description: "Show active connections" },
		],
	},
	{
		category: "Files & Folders",
		commands: [
			{ name: "List Desktop", icon: "rectangle-stack", command: "dir %USERPROFILE%\\Desktop", description: "List desktop files" },
			{ name: "List Downloads", icon: "arrow-down-tray", command: "dir %USERPROFILE%\\Downloads", description: "List downloads" },
			{ name: "List Documents", icon: "document", command: "dir %USERPROFILE%\\Documents", description: "List documents" },
			{ name: "Open Desktop", icon: "folder", command: "start %USERPROFILE%\\Desktop", description: "Open Desktop folder" },
			{ name: "Open Downloads", icon: "inbox-arrow-down", command: "start %USERPROFILE%\\Downloads", description: "Open Downloads folder" },
			{ name: "Recent Files", icon: "clock", command: "dir %APPDATA%\\Microsoft\\Windows\\Recent", description: "Show recent files" },
		],
	},
	{
		category: "Process Management",
		commands: [
			{ name: "Kill Chrome", icon: "x-circle", command: "taskkill /F /IM chrome.exe", description: "Force close Chrome" },
			{ name: "Kill Edge", icon: "x-circle", command: "taskkill /F /IM msedge.exe", description: "Force close Edge" },
			{ name: "Kill Firefox", icon: "x-circle", command: "taskkill /F /IM firefox.exe", description: "Force close Firefox" },
			{ name: "Kill Notepad", icon: "x-circle", command: "taskkill /F /IM notepad.exe", description: "Force close Notepad" },
			{ name: "Process Tree", icon: "queue-list", command: "tasklist /V", description: "Show detailed process list" },
		],
	},
	{
		category: "Disk & Cleanup",
		commands: [
			{ name: "Disk Cleanup", icon: "sparkles", command: "cleanmgr", description: "Open Disk Cleanup" },
			{ name: "Check Disk", icon: "magnifying-glass", command: "chkdsk C:", description: "Check C: drive for errors" },
			{ name: "Clear Temp", icon: "trash", command: "del /q/f/s %TEMP%\\*", description: "Delete temp files" },
			{ name: "Empty Recycle", icon: "archive-box-x-mark", command: "rd /s /q %systemdrive%\\$Recycle.bin", description: "Empty recycle bin" },
			{ name: "Disk Usage", icon: "chart-pie", command: "wmic logicaldisk get size,freespace,caption", description: "Show disk usage" },
		],
	},
	{
		category: "Performance",
		commands: [
			{ name: "Resource Monitor", icon: "presentation-chart-line", command: "start perfmon /res", description: "Open Resource Monitor" },
			{ name: "Performance Monitor", icon: "chart-bar", command: "start perfmon", description: "Open Performance Monitor" },
			{ name: "Memory Usage", icon: "server-stack", command: "wmic OS get FreePhysicalMemory,TotalVisibleMemorySize", description: "Check RAM usage" },
			{ name: "CPU Usage", icon: "cog", command: "wmic cpu get loadpercentage", description: "Check CPU usage" },
			{ name: "Startup Programs", icon: "rocket-launch", command: "wmic startup get caption,command", description: "List startup programs" },
			{ name: "Services", icon: "wrench-screwdriver", command: "start services.msc", description: "Open Services" },
		],
	},
	{
		category: "Advanced Tools",
		commands: [
			{ name: "Device Manager", icon: "device-phone-mobile", command: "start devmgmt.msc", description: "Open Device Manager" },
			{ name: "Disk Management", icon: "server", command: "start diskmgmt.msc", description: "Open Disk Management" },
			{ name: "Registry Editor", icon: "document-text", command: "start regedit", description: "Open Registry Editor" },
			{ name: "Event Viewer", icon: "document-magnifying-glass", command: "start eventvwr", description: "Open Event Viewer" },
			{ name: "System Properties", icon: "cog-8-tooth", command: "start sysdm.cpl", description: "Open System Properties" },
			{ name: "Scheduled Tasks", icon: "calendar", command: "start taskschd.msc", description: "Open Task Scheduler" },
		],
	},
	{
		category: "Utilities",
		commands: [
			{ name: "Screenshot Tool", icon: "camera", command: "start snippingtool", description: "Open Snipping Tool" },
			{ name: "Character Map", icon: "language", command: "start charmap", description: "Open Character Map" },
			{ name: "Magnifier", icon: "magnifying-glass-plus", command: "start magnify", description: "Open Magnifier" },
			{ name: "On-Screen Keyboard", icon: "command-line", command: "start osk", description: "Open On-Screen Keyboard" },
			{ name: "Sound Settings", icon: "speaker-wave", command: "start mmsys.cpl", description: "Open Sound Settings" },
			{ name: "Display Settings", icon: "tv", command: "start desk.cpl", description: "Open Display Settings" },
		],
	},
];
