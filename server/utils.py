def load_system_prompt(filepath="system_prompt.txt"):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        return "You are a helpful AI bot. Your name is Databot."
