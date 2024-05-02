import random

def create_matches(players):
    if len(players) < 2:
        return "Oyuncu sayısı en az 2 olmalıdır."
    
    random.shuffle(players)  # Oyuncuları rastgele karıştır
    matches = []
    
    # Oyuncuları eşleştir
    for i in range(0, len(players) - 1, 2):
        matches.append((players[i], players[i + 1]))
    
    # Tek sayıda oyuncu varsa, son oyuncuyu son maça ekleyin
    if len(players) % 2 == 1:
        matches[-1] = matches[-1] + (players[-1],)
    
    return matches

# Oyuncu listesi örneği
players = ['Oyuncu1', 'Oyuncu2', 'Oyuncu3', 'Oyuncu4', 'Oyuncu5', 'Oyuncu6', 'Oyuncu7', 'Oyuncu8', 'Oyuncu9']

# Eşleşmeleri oluştur ve yazdır
matches = create_matches(players)
for match in matches:
    print(" vs ".join(match))

def next_round(winners):
    if len(winners) < 2:
        return "Kazanan sayısı en az 2 olmalıdır."
    
    random.shuffle(winners)  # Kazananları rastgele karıştır
    next_matches = []
    
    # Kazananları eşleştir
    for i in range(0, len(winners) - 1, 2):
        next_matches.append((winners[i], winners[i + 1]))
    
    # Tek sayıda kazanan varsa, son kazananı son maça ekleyin
    if len(winners) % 2 == 1:
        next_matches[-1] = next_matches[-1] + (winners[-1],)
    
    return next_matches

# Önceki turun kazananları örneği
winners = ['Kazanan1', 'Kazanan2', 'Kazanan3', 'Kazanan4', 'Kazanan5']

# Yeni eşleşmeleri oluştur ve yazdır
next_matches = next_round(winners)
for match in next_matches:
    print(" vs ".join(match))
