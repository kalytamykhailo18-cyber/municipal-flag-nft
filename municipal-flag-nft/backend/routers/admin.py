"""
Admin API Router.
"""
import json
from typing import Optional, List
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import (
    Country, Region, Municipality, Flag, User,
    FlagInterest, FlagOwnership, Auction, AuctionStatus
)
from schemas import AdminStatsResponse, MessageResponse
from config import settings


class IPFSMappingItem(BaseModel):
    """Schema for IPFS mapping import."""
    flag_id: int
    image_ipfs_hash: str
    metadata_ipfs_hash: str


class IPFSImportResponse(BaseModel):
    """Response for IPFS import."""
    message: str
    updated: int
    not_found: int

router = APIRouter(tags=["Admin"])


def verify_admin(x_admin_key: Optional[str] = Header(None)):
    """Verify admin API key for protected endpoints."""
    if x_admin_key != settings.admin_api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing admin API key"
        )
    return True


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin)
):
    """Get overall statistics for the admin panel."""
    total_countries = db.query(func.count(Country.id)).scalar()
    total_regions = db.query(func.count(Region.id)).scalar()
    total_municipalities = db.query(func.count(Municipality.id)).scalar()
    total_flags = db.query(func.count(Flag.id)).scalar()
    total_users = db.query(func.count(User.id)).scalar()
    total_interests = db.query(func.count(FlagInterest.id)).scalar()
    total_ownerships = db.query(func.count(FlagOwnership.id)).scalar()
    total_auctions = db.query(func.count(Auction.id)).scalar()
    active_auctions = db.query(func.count(Auction.id)).filter(
        Auction.status == AuctionStatus.ACTIVE
    ).scalar()
    completed_pairs = db.query(func.count(Flag.id)).filter(
        Flag.is_pair_complete == True
    ).scalar()

    return AdminStatsResponse(
        total_countries=total_countries or 0,
        total_regions=total_regions or 0,
        total_municipalities=total_municipalities or 0,
        total_flags=total_flags or 0,
        total_users=total_users or 0,
        total_interests=total_interests or 0,
        total_ownerships=total_ownerships or 0,
        total_auctions=total_auctions or 0,
        active_auctions=active_auctions or 0,
        completed_pairs=completed_pairs or 0
    )


@router.post("/seed", response_model=MessageResponse)
def seed_demo_data(
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin)
):
    """Seed the database with demo data (only if empty)."""
    # Check if data already exists
    existing_countries = db.query(Country).count()
    if existing_countries > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database already has data. Cannot seed."
        )

    # Import seed function
    from seed_data import seed_database
    seed_database(db)

    return MessageResponse(message="Demo data seeded successfully")


@router.post("/reset", response_model=MessageResponse)
def reset_database(
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin)
):
    """Reset the database (delete all data). USE WITH CAUTION."""
    # Delete in correct order to respect foreign keys
    db.query(FlagInterest).delete()
    db.query(FlagOwnership).delete()
    from models import Bid, UserConnection
    db.query(Bid).delete()
    db.query(Auction).delete()
    db.query(UserConnection).delete()
    db.query(User).delete()
    db.query(Flag).delete()
    db.query(Municipality).delete()
    db.query(Region).delete()
    db.query(Country).delete()
    db.commit()

    return MessageResponse(message="Database reset successfully")


@router.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {
        "status": "healthy",
        "project": settings.project_name,
        "environment": settings.environment
    }


@router.post("/import-ipfs", response_model=IPFSImportResponse)
def import_ipfs_mapping(
    mappings: List[IPFSMappingItem],
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin)
):
    """Import IPFS hashes from the ipfs_mapping.json file into flags."""
    updated = 0
    not_found = 0

    for mapping in mappings:
        flag = db.query(Flag).filter(Flag.id == mapping.flag_id).first()
        if flag:
            flag.image_ipfs_hash = mapping.image_ipfs_hash
            flag.metadata_ipfs_hash = mapping.metadata_ipfs_hash
            updated += 1
        else:
            not_found += 1

    db.commit()

    return IPFSImportResponse(
        message=f"IPFS hashes imported successfully",
        updated=updated,
        not_found=not_found
    )


@router.post("/import-ipfs-file", response_model=IPFSImportResponse)
def import_ipfs_from_file(
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin)
):
    """Import IPFS hashes from the local ipfs_mapping.json file."""
    # Look for ipfs_mapping.json in the backend directory
    mapping_file = Path(__file__).parent.parent / "ipfs_mapping.json"

    if not mapping_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ipfs_mapping.json not found at {mapping_file}"
        )

    with open(mapping_file, 'r') as f:
        mappings = json.load(f)

    updated = 0
    not_found = 0

    for mapping in mappings:
        flag = db.query(Flag).filter(Flag.id == mapping["flag_id"]).first()
        if flag:
            flag.image_ipfs_hash = mapping["image_ipfs_hash"]
            flag.metadata_ipfs_hash = mapping["metadata_ipfs_hash"]
            updated += 1
        else:
            not_found += 1

    db.commit()

    return IPFSImportResponse(
        message=f"IPFS hashes imported from file successfully",
        updated=updated,
        not_found=not_found
    )
