import sqlite3
import requests

# Conecta ou cria o banco
conn = sqlite3.connect("games.db")
cursor = conn.cursor()

# Cria a tabela
cursor.execute("""
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT,
    price INTEGER
)
""")
conn.commit()

# Jogos para buscar
jogos = [
    "Elden Ring", "Hades", "Cyberpunk 2077", "Hollow Knight", "FIFA 23",
    "GTA V", "God of War", "Zelda", "Baldur's Gate 3", "The Witcher 3"
]

# Busca e insere os jogos
for nome in jogos:
    try:
        url = f"https://store.steampowered.com/api/storesearch/?term={nome}&l=portuguese&cc=BR"
        res = requests.get(url)
        data = res.json()

        if data.get("items"):
            game = data["items"][0]
            game_id = game["id"]
            name = game["name"]
            image = game.get("tiny_image", "")
            price = game.get("price", {}).get("final", 0)

            cursor.execute("INSERT OR IGNORE INTO games (id, name, image, price) VALUES (?, ?, ?, ?)",
                        (game_id, name, image, price))
            print(f"✅ Inserido: {name}")
    except Exception as e:
        print(f"❌ Erro ao buscar {nome}: {e}")

conn.commit()
conn.close()
print("🎮 Banco 'games.db' finalizado com até 10 jogos.")
