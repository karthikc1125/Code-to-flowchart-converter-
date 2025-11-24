# Test Python if/elif/else statements
x = 10

if x > 0:
    print("Positive number")
elif x < 0:
    print("Negative number")
else:
    print("Zero")

# Another example with nested conditions
if x > 5:
    if x > 15:
        print("Greater than 15")
    else:
        print("Between 5 and 15")
elif x == 0:
    print("Exactly zero")
else:
    print("Negative number")