import json

# Let's inspect existing curriculum steps to verify all information is captured
curr = json.load(open('data/curriculum.json'))
print(f"Loaded {len(curr)} steps from data/curriculum.json")

# Map of the 19 master modules
master_modules_count = 19
print(f"Targeting {master_modules_count} consolidated Master Modules without duplication.")
