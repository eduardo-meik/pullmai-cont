#!/usr/bin/env python3
import firebase_admin
from firebase_admin import credentials, firestore

def check_firebase_data():
    try:
        # Initialize Firebase
        try:
            firebase_admin.get_app()
        except ValueError:
            cred = credentials.Certificate('pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json')
            firebase_admin.initialize_app(cred)

        db = firestore.client()

        # Check contracts
        print('=== CONTRACTS ===')
        contracts = db.collection('contratos').limit(3).get()
        print(f'Found {len(contracts)} contracts')
        
        for i, doc in enumerate(contracts):
            data = doc.to_dict()
            print(f'\nContract {i+1} (ID: {doc.id}):')
            for key, value in data.items():
                if any(word in key.lower() for word in ['contraparte', 'organizacion']):
                    print(f'  {key}: {value}')

        # Check organizations  
        print('\n=== ORGANIZATIONS ===')
        orgs = db.collection('organizaciones').limit(5).get()
        print(f'Found {len(orgs)} organizations')
        
        for i, doc in enumerate(orgs):
            data = doc.to_dict()
            print(f'  {i+1}. {doc.id}: {data.get("nombre", "No name")}')

    except Exception as e:
        print(f'Error: {e}')

if __name__ == "__main__":
    check_firebase_data()
