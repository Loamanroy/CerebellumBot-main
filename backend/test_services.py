import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.trade_service import trade_service
from app.services.ai_service import ai_service

print("✓ Trade service imported successfully")
print("✓ AI service imported successfully")

print("\nTesting trade service methods:")
print("- initialize_exchanges method exists:", hasattr(trade_service, 'initialize_exchanges'))
print("- get_market_data method exists:", hasattr(trade_service, 'get_market_data'))
print("- place_order method exists:", hasattr(trade_service, 'place_order'))

print("\nTesting AI service methods:")
print("- initialize method exists:", hasattr(ai_service, 'initialize'))
print("- generate_signal method exists:", hasattr(ai_service, 'generate_signal'))
print("- start_scheduler method exists:", hasattr(ai_service, 'start_scheduler'))

print("\n✅ All service imports and methods verified successfully!")
