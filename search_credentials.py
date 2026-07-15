import os

search_val = "635648658511339"
user_dir = os.path.expanduser("~")

paths = [
    r"AppData\Local",
    r"AppData\Roaming",
    r"Downloads"
]

found = False
for p in paths:
    root_path = os.path.join(user_dir, p)
    if os.path.exists(root_path):
        print("Searching in:", root_path)
        for r, dirs, files in os.walk(root_path):
            # Skip large directories
            if any(x in r for x in ["node_modules", ".git", ".gradle", "cache", "Cache", "Local Storage", "IndexedDB", "Microsoft"]):
                continue
            for file in files:
                # Only check text-like files under 1MB
                if file.endswith((".txt", ".json", ".xml", ".properties", ".yml", ".yaml", ".js", ".ts", ".html")):
                    full_path = os.path.join(r, file)
                    try:
                        if os.path.getsize(full_path) < 1000000:
                            with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                                content = f.read()
                                if search_val in content:
                                    print(f"FOUND IN: {full_path}")
                                    # Print lines around it
                                    lines = content.splitlines()
                                    for idx, line in enumerate(lines):
                                        if search_val in line:
                                            start = max(0, idx - 5)
                                            end = min(len(lines), idx + 6)
                                            print(f"--- Context in {file} ---")
                                            for l in lines[start:end]:
                                                print(l)
                                            found = True
                    except Exception:
                        pass

if not found:
    print("Not found in text files.")
