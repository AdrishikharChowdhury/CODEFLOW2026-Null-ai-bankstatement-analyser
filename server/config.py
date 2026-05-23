from os import getenv
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = getenv("SUPABASE_SERVICE_ROLE_KEY")