from decimal import Decimal, localcontext

DIGITS = 10000

# Формула Чудновских для вычисления числа π
with localcontext() as ctx:
    ctx.prec = DIGITS + 20

    M = 1
    L = 13591409
    X = 1
    K = 6
    S = Decimal(L)

    for k in range(1, DIGITS // 14 + 3):
        M = (K**3 - 16*K) * M // (k**3)
        L += 545140134
        X *= -262537412640768000
        S += Decimal(M * L) / X
        K += 12

    pi = 426880 * Decimal(10005).sqrt() / S

    # Берём ровно 10000 цифр после запятой
    digits = format(pi, "f").split(".")[1][:DIGITS]

with open("pi-digits.txt", "w", encoding="utf-8") as file:
    file.write(digits)

print("Сохранено цифр:", len(digits))
print("Начало:", digits[:30])
