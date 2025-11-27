"""
Script to import IPFS hashes from ipfs_mapping.json into the database.
Run this after uploading images to IPFS.
"""
import json
from pathlib import Path
import sys

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

from database import SessionLocal, init_db
from models import Flag

def import_ipfs_hashes():
    """Import IPFS hashes from ipfs_mapping.json into the database."""
    mapping_file = Path(__file__).parent / "ipfs_mapping.json"

    if not mapping_file.exists():
        print(f"ERROR: ipfs_mapping.json not found at {mapping_file}")
        return False

    with open(mapping_file, 'r') as f:
        mappings = json.load(f)

    print(f"Found {len(mappings)} mappings to import")

    # Initialize database
    init_db()
    db = SessionLocal()

    try:
        updated = 0
        not_found = 0

        for mapping in mappings:
            flag = db.query(Flag).filter(Flag.id == mapping["flag_id"]).first()
            if flag:
                flag.image_ipfs_hash = mapping["image_ipfs_hash"]
                flag.metadata_ipfs_hash = mapping["metadata_ipfs_hash"]
                updated += 1
                print(f"  Updated flag {flag.id}: {mapping['image_ipfs_hash'][:20]}...")
            else:
                not_found += 1
                print(f"  Flag {mapping['flag_id']} not found in database")

        db.commit()

        print(f"\nImport complete!")
        print(f"  Updated: {updated}")
        print(f"  Not found: {not_found}")

        return True

    except Exception as e:
        print(f"ERROR: {e}")
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    import_ipfs_hashes()
