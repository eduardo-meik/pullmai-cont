#!/usr/bin/env python3
"""
Script to check and update organization documents with legal representative fields
"""
import firebase_admin
from firebase_admin import credentials, firestore

def check_and_update_organization_fields():
    try:
        # Initialize Firebase
        try:
            firebase_admin.get_app()
        except ValueError:
            cred = credentials.Certificate('pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json')
            firebase_admin.initialize_app(cred)

        db = firestore.client()

        print('🔍 Checking organization documents for legal representative fields...\n')

        # Get all organizations
        orgs_ref = db.collection('organizaciones')
        orgs = orgs_ref.get()
        
        print(f'📊 Found {len(orgs)} organization documents')
        print('=' * 50)

        updated_count = 0
        
        for doc in orgs:
            data = doc.to_dict()
            org_name = data.get('nombre', 'Unknown')
            print(f'\n🏢 Organization: {org_name} (ID: {doc.id})')
            
            # Check current fields
            current_fields = list(data.keys())
            print(f'   Current fields: {", ".join(current_fields)}')
            
            # Check if legal representative fields exist
            has_representante = 'representanteLegal' in data
            has_rut_representante = 'rutRepresentanteLegal' in data
            
            print(f'   Has representanteLegal: {"✅" if has_representante else "❌"}')
            print(f'   Has rutRepresentanteLegal: {"✅" if has_rut_representante else "❌"}')
            
            # Update if fields are missing
            if not has_representante or not has_rut_representante:
                print(f'   🔄 Adding missing fields...')
                
                updates = {}
                if not has_representante:
                    updates['representanteLegal'] = ''
                if not has_rut_representante:
                    updates['rutRepresentanteLegal'] = ''
                
                # Apply the update
                doc.reference.update(updates)
                updated_count += 1
                print(f'   ✅ Updated with fields: {", ".join(updates.keys())}')
            else:
                print(f'   ✅ Already has all required fields')
                
                # Show current values if they exist and are not empty
                if data.get('representanteLegal'):
                    print(f'   🔹 Current representanteLegal: {data["representanteLegal"]}')
                if data.get('rutRepresentanteLegal'):
                    print(f'   🔹 Current rutRepresentanteLegal: {data["rutRepresentanteLegal"]}')

        print('\n' + '=' * 50)
        print(f'✅ Migration completed!')
        print(f'📈 Updated {updated_count} organization documents')
        print(f'📋 Total organizations: {len(orgs)}')
        
        if updated_count > 0:
            print('\n🎯 Next steps:')
            print('1. Test the organization configuration form in the app')
            print('2. Try saving legal representative information')
            print('3. Test contract generation with auto-fill')
        else:
            print('\n🎉 All organizations already have the required fields!')

    except Exception as e:
        print(f'❌ Error: {e}')
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_and_update_organization_fields()
