import math

def calculate_single_elimination_rounds(teams):
    if teams < 2:
        return 0  # En az 2 takım olmalı
    return math.ceil(math.log2(teams))

# Kullanım
teams = 17
rounds = calculate_single_elimination_rounds(teams)
print(f"Round sayısı: {rounds}")
