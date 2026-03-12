"""
Project Bulava API Tests
Tests for the LLM-Augmented Ukraine Advocacy Engine endpoints:
- POST /api/bulava/augment - Generate single augmentation
- GET /api/bulava/categories - Get available categories and types
- POST /api/bulava/batch-demo - Batch augmentation simulation
"""
import pytest
import requests
import os

# Use public URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://adflow-pipeline.preview.emergentagent.com')


class TestBulavaAugmentEndpoint:
    """Tests for single augmentation generation"""
    
    def test_augment_default(self):
        """Test POST /api/bulava/augment with default category"""
        response = requests.post(
            f"{BASE_URL}/api/bulava/augment",
            json={"ad_category": "fintech"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "text" in data
        assert "tier" in data
        assert "type" in data
        assert "latency_ms" in data
        assert "ad_category" in data
        
        # Verify tier is 3 (template fallback)
        assert data["tier"] == 3
        
        # Verify latency is sub-millisecond
        assert data["latency_ms"] < 10  # Should be < 1ms but allow some margin
        
        # Verify text is not empty
        assert len(data["text"]) > 0
        
        print(f"Augmentation: tier={data['tier']}, type={data['type']}, latency={data['latency_ms']}ms")
        print(f"Text: {data['text'][:100]}...")
    
    def test_augment_with_type(self):
        """Test POST /api/bulava/augment with specific augmentation type"""
        response = requests.post(
            f"{BASE_URL}/api/bulava/augment",
            json={"ad_category": "sportswear", "type": "inspiration"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["type"] == "inspiration"
        assert data["tier"] == 3
        assert "Ukrainian" in data["text"] or "Ukraine" in data["text"] or "Diia" in data["text"]
        print(f"Inspiration augmentation: {data['text']}")
    
    def test_augment_all_categories(self):
        """Test augmentation works for all 9 ad categories"""
        categories = ["sportswear", "fintech", "energy_drink", "streaming", 
                      "gaming", "insurance", "beauty", "travel", "fast_food"]
        
        for cat in categories:
            response = requests.post(
                f"{BASE_URL}/api/bulava/augment",
                json={"ad_category": cat}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["ad_category"] == cat
            assert len(data["text"]) > 0
            print(f"✓ {cat}: {data['text'][:50]}...")
    
    def test_augment_all_types(self):
        """Test augmentation works for all 5 augmentation types"""
        types = ["fact", "product_parallel", "call_to_action", "cultural", "inspiration"]
        
        for aug_type in types:
            response = requests.post(
                f"{BASE_URL}/api/bulava/augment",
                json={"ad_category": "fintech", "type": aug_type}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["type"] == aug_type
            print(f"✓ {aug_type}: {data['text'][:50]}...")


class TestBulavaCategoriesEndpoint:
    """Tests for categories/types listing"""
    
    def test_get_categories(self):
        """Test GET /api/bulava/categories returns all available options"""
        response = requests.get(f"{BASE_URL}/api/bulava/categories")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "ad_categories" in data
        assert "augmentation_types" in data
        assert "content_categories" in data
        assert "device_types" in data
        
        # Verify 9 ad categories
        assert len(data["ad_categories"]) == 9
        expected_cats = ["sportswear", "fintech", "energy_drink", "streaming", 
                        "gaming", "insurance", "beauty", "travel", "fast_food"]
        for cat in expected_cats:
            assert cat in data["ad_categories"], f"Missing category: {cat}"
        
        # Verify 5 augmentation types
        assert len(data["augmentation_types"]) == 5
        expected_types = ["fact", "product_parallel", "call_to_action", "cultural", "inspiration"]
        for aug_type in expected_types:
            assert aug_type in data["augmentation_types"], f"Missing type: {aug_type}"
        
        print(f"Ad categories: {data['ad_categories']}")
        print(f"Augmentation types: {data['augmentation_types']}")


class TestBulavaBatchDemoEndpoint:
    """Tests for batch augmentation simulation"""
    
    def test_batch_demo_default(self):
        """Test POST /api/bulava/batch-demo with default count"""
        response = requests.post(
            f"{BASE_URL}/api/bulava/batch-demo",
            json={"count": 10}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "count" in data
        assert "results" in data
        assert "tier_distribution" in data
        assert "type_distribution" in data
        
        # Verify count matches
        assert data["count"] == 10
        assert len(data["results"]) == 10
        
        # Verify tier distribution (all Tier 3 for template)
        assert data["tier_distribution"]["tier_3_template"] == 10
        assert data["tier_distribution"]["tier_1_speculative"] == 0
        assert data["tier_distribution"]["tier_2_realtime"] == 0
        
        print(f"Batch count: {data['count']}")
        print(f"Type distribution: {data['type_distribution']}")
    
    def test_batch_demo_20_ads(self):
        """Test POST /api/bulava/batch-demo with 20 ads (like demo button)"""
        response = requests.post(
            f"{BASE_URL}/api/bulava/batch-demo",
            json={"count": 20}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["count"] == 20
        assert len(data["results"]) == 20
        
        # Verify all results have required fields
        for result in data["results"]:
            assert "ad_category" in result
            assert "augmentation" in result
            assert "type" in result
            assert "tier" in result
            assert result["tier"] == 3  # All Tier 3 template
        
        # Verify type distribution adds up
        total_types = sum(data["type_distribution"].values())
        assert total_types == 20
        
        print(f"✓ 20-ad batch working")
        print(f"Tier distribution: {data['tier_distribution']}")
        print(f"Type distribution: {data['type_distribution']}")
    
    def test_batch_demo_max_limit(self):
        """Test batch demo respects max limit of 50"""
        response = requests.post(
            f"{BASE_URL}/api/bulava/batch-demo",
            json={"count": 100}  # Request 100, should cap at 50
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should be capped at 50
        assert data["count"] == 50
        assert len(data["results"]) == 50
        print(f"✓ Batch capped at 50 (requested 100)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
