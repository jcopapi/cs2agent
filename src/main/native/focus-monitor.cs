using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

namespace CS2FocusMonitor {
    class Program {
        [DllImport("user32.dll")]
        static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

        [DllImport("user32.dll")]
        static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

        [DllImport("user32.dll")]
        static extern short GetAsyncKeyState(int vKey);

        static bool isEnabled = true;
        static int alignVKey = 0x14; // VK_CAPITAL (CapsLock)
        static int overlayVKey = 0x70; // VK_F1
        static int nextVKey = 0x71; // VK_F2

        static int ParseKey(string name, int defaultVal) {
            if (string.IsNullOrEmpty(name)) return defaultVal;
            string upper = name.ToUpperInvariant().Trim();
            if (upper == "CAPSLOCK" || upper == "CAPITAL") return 0x14;
            if (upper == "F1") return 0x70;
            if (upper == "F2") return 0x71;
            if (upper == "F3") return 0x72;
            if (upper == "F4") return 0x73;
            if (upper == "F5") return 0x74;
            if (upper == "F6") return 0x75;
            if (upper == "F7") return 0x76;
            if (upper == "F8") return 0x77;
            if (upper == "F9") return 0x78;
            if (upper == "F10") return 0x79;
            if (upper == "F11") return 0x7A;
            if (upper == "F12") return 0x7B;
            if (upper == "SCROLLLOCK") return 0x91;
            if (upper == "INSERT") return 0x2D;
            if (upper == "HOME") return 0x24;
            if (upper == "PAGEUP") return 0x21;
            if (upper == "PAGEDOWN") return 0x22;
            if (upper.Length == 1 && upper[0] >= 'A' && upper[0] <= 'Z') {
                return (int)upper[0];
            }
            return defaultVal;
        }

        static void StdinListener() {
            while (true) {
                try {
                    string line = Console.ReadLine();
                    if (line == null) break;
                    line = line.Trim();
                    if (line.StartsWith("ENABLED:")) {
                        isEnabled = line.EndsWith("1");
                    } else if (line.StartsWith("KEYS:")) {
                        string[] parts = line.Substring(5).Split(',');
                        if (parts.Length >= 1) alignVKey = ParseKey(parts[0], 0x14);
                        if (parts.Length >= 2) overlayVKey = ParseKey(parts[1], 0x70);
                        if (parts.Length >= 3) nextVKey = ParseKey(parts[2], 0x71);
                    } else if (line == "EXIT") {
                        Environment.Exit(0);
                    }
                } catch {
                    break;
                }
            }
        }

        static bool IsCs2Foreground() {
            IntPtr hwnd = GetForegroundWindow();
            if (hwnd == IntPtr.Zero) return false;

            uint pid = 0;
            GetWindowThreadProcessId(hwnd, out pid);
            if (pid == 0) return false;

            try {
                Process p = Process.GetProcessById((int)pid);
                string procName = p.ProcessName.ToLowerInvariant();
                if (procName == "cs2" || procName == "csgo") return true;

                StringBuilder sb = new StringBuilder(256);
                if (GetWindowText(hwnd, sb, 256) > 0) {
                    string title = sb.ToString().ToLowerInvariant();
                    if (title.Contains("counter-strike 2") || title.Contains("counter-strike")) {
                        return true;
                    }
                }
            } catch {
                return false;
            }
            return false;
        }

        static void Main() {
            Thread t = new Thread(StdinListener);
            t.IsBackground = true;
            t.Start();

            bool wasAlignDown = false;
            bool wasOverlayDown = false;
            bool wasNextDown = false;

            while (true) {
                try {
                    if (!isEnabled || !IsCs2Foreground()) {
                        if (wasAlignDown) {
                            wasAlignDown = false;
                            Console.WriteLine("ALIGN_UP");
                        }
                        wasOverlayDown = false;
                        wasNextDown = false;
                        Thread.Sleep(50);
                        continue;
                    }

                    // 1. Align Key (Hold state)
                    bool isAlignDown = (GetAsyncKeyState(alignVKey) & 0x8000) != 0;
                    if (isAlignDown && !wasAlignDown) {
                        wasAlignDown = true;
                        Console.WriteLine("ALIGN_DOWN");
                    } else if (!isAlignDown && wasAlignDown) {
                        wasAlignDown = false;
                        Console.WriteLine("ALIGN_UP");
                    }

                    // 2. Overlay Key (Toggle state)
                    bool isOverlayDown = (GetAsyncKeyState(overlayVKey) & 0x8000) != 0;
                    if (isOverlayDown && !wasOverlayDown) {
                        wasOverlayDown = true;
                        Console.WriteLine("OVERLAY_TOGGLE");
                    } else if (!isOverlayDown && wasOverlayDown) {
                        wasOverlayDown = false;
                    }

                    // 3. Next Pixel Key (Press state)
                    bool isNextDown = (GetAsyncKeyState(nextVKey) & 0x8000) != 0;
                    if (isNextDown && !wasNextDown) {
                        wasNextDown = true;
                        Console.WriteLine("NEXT_PIXEL");
                    } else if (!isNextDown && wasNextDown) {
                        wasNextDown = false;
                    }

                    Thread.Sleep(20);
                } catch {
                    Thread.Sleep(50);
                }
            }
        }
    }
}
