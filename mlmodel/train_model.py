
import pandas as pd
import numpy as np
import json
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Load dataset
df = pd.read_csv('mlmodel/data/Training.csv')

# Get all symptom columns (Symptom_1 to Symptom_17)
symptom_cols = df.columns[1:]


# Extract all unique symptoms across all rows
symptom_set = set()

for row in df[symptom_cols].values:
    for symptom in row:
        if pd.notna(symptom):
            symptom_set.add(symptom.strip())

# Sort for consistent order
symptom_list = sorted(list(symptom_set))

# Save for frontend/backend use
with open('symptom_list.json', 'w') as f:
    json.dump(symptom_list, f)



X = []
y = []

for index, row in df.iterrows():
    # Normalize all symptom strings in that row
    symptoms = [str(s).strip().lower().replace(" ", "_") for s in row[symptom_cols].values if pd.notna(s)]

# Now build binary vector using same formatting
    vector = [1 if s.lower().replace(" ", "_") in symptoms else 0 for s in symptom_list]

    X.append(vector)
    #y.append(row['Disease'])
    y.append(str(row['Disease']).strip().lower())

    # ➕ Add sparse versions (1–3 symptom samples)
    for _ in range(3):
        sample_symptoms = np.random.choice(symptoms, size=np.random.randint(1, min(4, len(symptoms)+1)), replace=False)
        sparse_vector = [1 if s in sample_symptoms else 0 for s in symptom_list]
        X.append(sparse_vector)
        y.append(str(row['Disease']).strip().lower()) 


# Convert to NumPy arrays
X = np.array(X)
y = np.array(y)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier()
# model = RandomForestClassifier(
#     n_estimators=300,
#     max_depth=25,
#     random_state=42,
#     class_weight='balanced'
# )


# from sklearn.model_selection import StratifiedShuffleSplit

# sss = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)

# for train_idx, test_idx in sss.split(X, y):
#     X_train, X_test = X[train_idx], X[test_idx]
#     y_train, y_test = y[train_idx], y[test_idx]


model.fit(X_train, y_train)

# Accuracy check (optional)
print("Accuracy:", model.score(X_test, y_test))


print("Total samples:", len(X))
print("Total labels:", len(y))

# from collections import Counter
# print(Counter(y))

print(X[0])
print(X.shape)
print("Non-zero symptom count in row 0:", sum(X[0]))



# Save model
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)
