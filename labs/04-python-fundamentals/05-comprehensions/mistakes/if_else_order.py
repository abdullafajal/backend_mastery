from catalog_data import catalog

labels = [p["name"] for p in catalog if p["price_paise"] < 50000 else "too costly"]
