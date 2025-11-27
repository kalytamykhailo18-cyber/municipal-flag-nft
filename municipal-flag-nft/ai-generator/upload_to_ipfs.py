"""
IPFS Upload Script for Municipal Flag NFT Game.

Uploads generated images and metadata to IPFS via Pinata.
Updates the database directly with IPFS hashes.
"""
import os
import sys
import json
import requests
from pathlib import Path
from typing import Dict, Optional

from tqdm import tqdm
from dotenv import load_dotenv

# Add backend to path for database access
ROOT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT_DIR / "backend"))

# Load environment variables
load_dotenv(ROOT_DIR / ".env")

from config import Config

# Ensure output directories exist
Config.ensure_directories()


class PinataUploader:
    """Upload files to IPFS using Pinata."""

    def __init__(self):
        self.api_key = os.getenv("PINATA_API_KEY", "")
        self.api_secret = os.getenv("PINATA_API_SECRET", "")
        self.jwt = os.getenv("PINATA_JWT", "")

        if not (self.api_key and self.api_secret) and not self.jwt:
            raise ValueError(
                "Pinata credentials not found. "
                "Set PINATA_API_KEY and PINATA_API_SECRET, or PINATA_JWT in .env"
            )

        self.base_url = "https://api.pinata.cloud"

    def _get_headers(self, for_upload: bool = False) -> Dict[str, str]:
        """Get headers for API requests."""
        if self.jwt:
            headers = {"Authorization": f"Bearer {self.jwt}"}
        else:
            headers = {
                "pinata_api_key": self.api_key,
                "pinata_secret_api_key": self.api_secret
            }

        if not for_upload:
            headers["Content-Type"] = "application/json"

        return headers

    def test_authentication(self) -> bool:
        """Test if Pinata credentials are valid."""
        try:
            response = requests.get(
                f"{self.base_url}/data/testAuthentication",
                headers=self._get_headers()
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Authentication test failed: {e}")
            return False

    def upload_file(self, file_path: Path, name: Optional[str] = None) -> Optional[str]:
        """
        Upload a file to IPFS.

        Args:
            file_path: Path to the file to upload
            name: Optional name for the file on Pinata

        Returns:
            IPFS hash (CID) or None if failed
        """
        if not file_path.exists():
            print(f"File not found: {file_path}")
            return None

        try:
            with open(file_path, 'rb') as file:
                files = {'file': (file_path.name, file)}

                metadata = {
                    "name": name or file_path.name,
                    "keyvalues": {
                        "project": "municipal-flag-nft",
                        "type": "image" if file_path.suffix in ['.png', '.jpg', '.jpeg'] else "metadata"
                    }
                }

                response = requests.post(
                    f"{self.base_url}/pinning/pinFileToIPFS",
                    files=files,
                    data={
                        "pinataMetadata": json.dumps(metadata),
                        "pinataOptions": json.dumps({"cidVersion": 1})
                    },
                    headers=self._get_headers(for_upload=True)
                )

                if response.status_code == 200:
                    return response.json()["IpfsHash"]
                else:
                    print(f"Upload failed: {response.status_code} - {response.text}")
                    return None

        except Exception as e:
            print(f"Error uploading file: {e}")
            return None

    def upload_json(self, data: Dict, name: str) -> Optional[str]:
        """
        Upload JSON data directly to IPFS.

        Args:
            data: Dictionary to upload as JSON
            name: Name for the JSON file

        Returns:
            IPFS hash (CID) or None if failed
        """
        try:
            payload = {
                "pinataContent": data,
                "pinataMetadata": {
                    "name": name,
                    "keyvalues": {
                        "project": "municipal-flag-nft",
                        "type": "metadata"
                    }
                },
                "pinataOptions": {
                    "cidVersion": 1
                }
            }

            response = requests.post(
                f"{self.base_url}/pinning/pinJSONToIPFS",
                json=payload,
                headers=self._get_headers()
            )

            if response.status_code == 200:
                return response.json()["IpfsHash"]
            else:
                print(f"Upload failed: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            print(f"Error uploading JSON: {e}")
            return None


def get_database_session():
    """Get a database session from the backend."""
    from database import SessionLocal, init_db
    init_db()
    return SessionLocal()


def get_flags_from_database(db):
    """Get all flags from database with their metadata."""
    from models import Flag, Municipality, Region, Country

    flags = db.query(Flag).join(
        Municipality
    ).join(
        Region
    ).join(
        Country
    ).all()

    result = []
    for flag in flags:
        municipality = flag.municipality
        region = municipality.region
        country = region.country

        # Build metadata
        category_name = flag.category.value.title()

        metadata = {
            "name": f"Flag at {flag.name}",
            "description": f"{flag.location_type} flag of {municipality.name}, {region.name}, {country.name}. Part of the Municipal Flag NFT collection.",
            "image": "",  # Will be set after upload
            "external_url": f"https://municipalflagnft.demo/{flag.id}",
            "attributes": [
                {"trait_type": "Country", "value": country.name},
                {"trait_type": "Country Code", "value": country.code},
                {"trait_type": "Region", "value": region.name},
                {"trait_type": "Municipality", "value": municipality.name},
                {"trait_type": "Location Type", "value": flag.location_type},
                {"trait_type": "Category", "value": category_name},
                {"display_type": "number", "trait_type": "Flag ID", "value": flag.id}
            ]
        }

        # Build image filename
        image_filename = f"{country.code}_{municipality.name.lower()}_{flag.id:03d}.png"

        result.append({
            "flag_id": flag.id,
            "flag": flag,
            "image_filename": image_filename,
            "metadata": metadata,
            "country_code": country.code,
            "municipality_name": municipality.name
        })

    return result


def update_flag_ipfs_hashes(db, flag_id: int, image_hash: str, metadata_hash: str):
    """Update a flag's IPFS hashes in the database."""
    from models import Flag

    flag = db.query(Flag).filter(Flag.id == flag_id).first()
    if flag:
        flag.image_ipfs_hash = image_hash
        flag.metadata_ipfs_hash = metadata_hash
        db.commit()
        return True
    return False


def upload_all_to_ipfs():
    """Upload all images and metadata to IPFS, updating the database directly."""
    print("=" * 60)
    print("Municipal Flag NFT - IPFS Upload")
    print("=" * 60)

    # Initialize uploader
    uploader = PinataUploader()

    # Test authentication
    print("\nTesting Pinata authentication...")
    if not uploader.test_authentication():
        print("ERROR: Pinata authentication failed!")
        print("Please check your PINATA_API_KEY and PINATA_API_SECRET in .env")
        return

    print("Authentication successful!")

    # Get database session
    print("\nConnecting to database...")
    db = get_database_session()

    # Get flags from database
    flags_data = get_flags_from_database(db)

    if not flags_data:
        print("ERROR: No flags found in database!")
        print("Please run the database seeding first:")
        print('  curl -X POST "http://localhost:8000/api/admin/seed" -H "X-Admin-Key: your-admin-key"')
        db.close()
        return

    print(f"\nFound {len(flags_data)} flags in database")

    # Track uploads
    images_uploaded = 0
    metadata_uploaded = 0
    skipped = 0
    failed = 0

    gateway = os.getenv("VITE_IPFS_GATEWAY", os.getenv("REACT_APP_IPFS_GATEWAY", "https://gateway.pinata.cloud/ipfs"))

    # Upload images and metadata
    print("\n--- Uploading to IPFS and updating database ---")

    for item in tqdm(flags_data, desc="Processing"):
        flag = item["flag"]

        # Skip if already has IPFS hashes
        if flag.image_ipfs_hash and flag.metadata_ipfs_hash:
            skipped += 1
            continue

        image_path = Config.OUTPUT_DIR / item["image_filename"]

        if not image_path.exists():
            tqdm.write(f"  SKIP: {item['image_filename']} (image not found)")
            failed += 1
            continue

        # Upload image if not already uploaded
        image_hash = flag.image_ipfs_hash
        if not image_hash:
            image_hash = uploader.upload_file(image_path, f"flag_{item['flag_id']}.png")

            if image_hash:
                images_uploaded += 1
            else:
                tqdm.write(f"  FAIL: {item['image_filename']} (image upload failed)")
                failed += 1
                continue

        # Update metadata with IPFS image URL
        metadata = item["metadata"]
        metadata["image"] = f"ipfs://{image_hash}"

        # Upload metadata JSON
        metadata_hash = uploader.upload_json(metadata, f"metadata_{item['flag_id']}.json")

        if metadata_hash:
            metadata_uploaded += 1

            # Update database directly
            update_flag_ipfs_hashes(db, item["flag_id"], image_hash, metadata_hash)
            tqdm.write(f"  OK: Flag {item['flag_id']} - {image_hash[:20]}...")
        else:
            tqdm.write(f"  FAIL: metadata for flag {item['flag_id']}")
            failed += 1

    db.close()

    # Summary
    print("\n" + "=" * 60)
    print("Upload Complete!")
    print("=" * 60)
    print(f"  Images uploaded:   {images_uploaded}")
    print(f"  Metadata uploaded: {metadata_uploaded}")
    print(f"  Skipped (exists):  {skipped}")
    print(f"  Failed:            {failed}")
    print(f"\nIPFS hashes saved directly to database!")
    print(f"No JSON mapping files needed.")

    # Print sample URL
    if images_uploaded > 0 or skipped > 0:
        print(f"\nSample URL format:")
        print(f"  {gateway}/<ipfs_hash>")


def verify_uploads():
    """Verify that uploads are accessible by checking database."""
    print("=" * 60)
    print("Verifying IPFS Uploads from Database")
    print("=" * 60)

    db = get_database_session()
    flags_data = get_flags_from_database(db)

    gateway = os.getenv("VITE_IPFS_GATEWAY", os.getenv("REACT_APP_IPFS_GATEWAY", "https://gateway.pinata.cloud/ipfs"))

    # Count flags with IPFS hashes
    with_hashes = sum(1 for f in flags_data if f["flag"].image_ipfs_hash)
    without_hashes = len(flags_data) - with_hashes

    print(f"\nFlags with IPFS hashes: {with_hashes}")
    print(f"Flags without IPFS hashes: {without_hashes}")

    if with_hashes == 0:
        print("\nNo uploads to verify.")
        db.close()
        return

    print(f"\nChecking first 5 uploads...")

    accessible = 0
    failed = 0

    flags_with_hashes = [f for f in flags_data if f["flag"].image_ipfs_hash][:5]

    for item in tqdm(flags_with_hashes, desc="Verifying"):
        flag = item["flag"]
        image_url = f"{gateway}/{flag.image_ipfs_hash}"

        try:
            response = requests.head(image_url, timeout=10)
            if response.status_code == 200:
                accessible += 1
            else:
                failed += 1
                tqdm.write(f"  FAIL: Flag {flag.id} - Status {response.status_code}")
        except Exception as e:
            failed += 1
            tqdm.write(f"  FAIL: Flag {flag.id} - {e}")

    db.close()
    print(f"\nVerification complete: {accessible} accessible, {failed} failed")


def show_status():
    """Show current IPFS upload status from database."""
    print("=" * 60)
    print("IPFS Upload Status")
    print("=" * 60)

    db = get_database_session()
    flags_data = get_flags_from_database(db)

    with_image = sum(1 for f in flags_data if f["flag"].image_ipfs_hash)
    with_metadata = sum(1 for f in flags_data if f["flag"].metadata_ipfs_hash)
    total = len(flags_data)

    print(f"\nTotal flags in database: {total}")
    print(f"Flags with image IPFS hash: {with_image}")
    print(f"Flags with metadata IPFS hash: {with_metadata}")
    print(f"Flags pending upload: {total - with_image}")

    db.close()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--verify":
            verify_uploads()
        elif sys.argv[1] == "--status":
            show_status()
        else:
            print("Usage: python upload_to_ipfs.py [--verify|--status]")
    else:
        upload_all_to_ipfs()
