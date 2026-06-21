import os
import logging
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("vigil-deepseek")
logging.basicConfig(level=logging.INFO)

API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
IS_PLACEHOLDER = not API_KEY or API_KEY.startswith("sk-placeholder") or API_KEY == "sk-your-key-here"

client = None
if not IS_PLACEHOLDER:
    try:
        client = OpenAI(
            api_key=API_KEY,
            base_url="https://api.deepseek.com/v1"  # Or https://api.deepseek.com
        )
        logger.info("DeepSeek client initialized successfully.")
    except Exception as e:
        logger.warning(f"Failed to initialize OpenAI client for DeepSeek: {e}")
        client = None
else:
    logger.warning("DeepSeek API Key is a placeholder. Using local fallback simulation.")

def is_ai_available() -> bool:
    return client is not None

def chat_completion(system: str, user: str, temperature: float = 0.3) -> str:
    """
    Executes a chat completion query to DeepSeek or uses local fallback if unavailable.
    """
    if client:
        try:
            # We call deepseek-chat
            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user}
                ],
                temperature=temperature,
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"DeepSeek Chat API call failed: {e}. Falling back to simulated response.")
    
    return get_fallback_chat_response(system, user)

def get_embeddings(text: str) -> list[float]:
    """
    Attempts to get embeddings from DeepSeek. If unavailable, returns None (caller will use local ONNX).
    """
    if client:
        try:
            # Note: DeepSeek doesn't natively support standard OpenAI embedding endpoints in all regions,
            # but if it does, we use deepseek-embedder or similar.
            response = client.embeddings.create(
                model="deepseek-embedder",  # fallback to standard model if they support it
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.warning(f"DeepSeek Embeddings API call failed: {e}. Returning None to trigger local ONNX fallback.")
    return None

def get_fallback_chat_response(system: str, user: str) -> str:
    """
    Generates intelligent local responses to simulate DeepSeek for the demo app.
    """
    user_lower = user.lower()
    
    # 1. Check if it's an email draft
    if "draft a" in user_lower and "follow-up email" in user_lower:
        # Extract metadata
        tone = "polite"
        if "firm" in user_lower:
            tone = "firm"
        elif "urgent" in user_lower:
            tone = "urgent"
            
        po_id = "PO-XXXX"
        for word in user.split():
            if "PO-" in word:
                po_id = word.strip(".,()[]{}")
                
        supplier = "Supplier"
        if "supplier:" in user_lower:
            parts = user.split("Supplier:")
            if len(parts) > 1:
                supplier = parts[1].split("\n")[0].strip()
                
        overdue_days = "a few"
        if "days overdue:" in user_lower:
            parts = user.split("days overdue:")
            if len(parts) > 1:
                overdue_days = parts[1].split("\n")[0].strip()

        value = "$0.00"
        if "value:" in user_lower:
            parts = user.split("value:")
            if len(parts) > 1:
                value = parts[1].split("\n")[0].strip()

        if tone == "polite":
            return f"""Subject: Checking in on Purchase Order {po_id} - Vigil Procurement

Dear {supplier} Team,

I hope this email finds you well. 

I'm writing to request a quick status update regarding our Purchase Order {po_id} (value: {value}), which was scheduled for delivery a few days ago (currently {overdue_days} days overdue). We value our partnership and would appreciate it if you could let us know when we can expect shipment.

Thank you for your assistance.

Best regards,
Vigil Procurement Assistant"""
        elif tone == "firm":
            return f"""Subject: URGENT: Outstanding Delivery for Purchase Order {po_id}

Dear {supplier} Team,

We have not yet received shipment for Purchase Order {po_id} (valued at {value}), which is now {overdue_days} days overdue. This follows our previous communication regarding this delay.

This delay is starting to impact our production schedule. Please provide the tracking details or a firm delivery date by the end of today so we can adjust our plans.

Sincerely,
Vigil Procurement Manager"""
        else: # urgent
            return f"""Subject: FINAL NOTICE: Non-Delivery of Purchase Order {po_id} - Contract Escalation

Dear {supplier} Management,

This is a formal escalation regarding the critical delay of Purchase Order {po_id} (valued at {value}), which is now {overdue_days} days overdue. Despite multiple follow-ups, we have not received a satisfactory delivery date or shipping confirmation.

Please be advised that if shipment confirmation with valid tracking is not received within 24 hours, we will be forced to cancel this order and review our supplier agreement, including potential penalties for contract non-compliance. 

We expect your immediate reply.

Regards,
Director of Global Procurement
Vigil Intelligence Corp"""

    # 2. Check if it's a supplier reply simulation
    elif "supplier reply email" in user_lower:
        scenario = "general_delay"
        for s in ["shipment_dispatched", "delay_weather", "delay_customs", "dispute_pricing", "partial_shipment"]:
            if s in user_lower:
                scenario = s
                break
                
        supplier = "Supplier"
        if "supplier:" in user_lower:
            parts = user.split("Supplier:")
            if len(parts) > 1:
                supplier = parts[1].split("\n")[0].strip()

        po_id = "PO-XXXX"
        for word in user.split():
            if "PO-" in word or "PO:" in word:
                po_id = word.replace("PO:", "").strip(".,()[]{}")

        if scenario == "shipment_dispatched":
            return f"""Subject: Re: Purchase Order {po_id} - Dispatched

Hi Vigil Procurement team,

Apologies for the delay! We've been experiencing high order volume. I'm pleased to report that your order has been dispatched today via Express Freight. The tracking number is TRK-88271-X. You should receive it within 24 hours.

Thanks for your patience.

Best,
Logistics Team, {supplier}"""
        elif scenario == "delay_weather":
            return f"""Subject: Re: Purchase Order {po_id} - Weather Delay Update

Hi Vigil Procurement,

We wanted to inform you that our regional shipping hub was hit by severe storm conditions yesterday, which has grounded several cargo flights. As a result, the delivery of your order {po_id} will be delayed by approximately 3 to 4 business days.

We are monitoring the situation and will send tracking info as soon as it leaves the facility.

Best regards,
Customer Support, {supplier}"""
        elif scenario == "delay_customs":
            return f"""Subject: Re: Purchase Order {po_id} - Customs Clearance Delay

Dear Vigil team,

Regarding PO {po_id}, our shipment is currently held up at customs. They are requesting some additional documentation regarding safety certificates, which we are preparing to submit today. 

We anticipate it will take another 5 business days to clear customs and reach your warehouse. We will keep you updated.

Best,
Compliance Manager, {supplier}"""
        elif scenario == "dispute_pricing":
            return f"""Subject: Re: Purchase Order {po_id} - Pricing Verification Needed

Hi Team,

We received your follow-up on PO {po_id}. Our billing department flagged a discrepancy: the purchase order indicates a unit price of $45.00 for the components, but our new catalog price is $60.30, which we communicated in April.

Could you please verify and update the PO total so we can release the shipment?

Thank you,
Accounts Receivable, {supplier}"""
        elif scenario == "partial_shipment":
            return f"""Subject: Re: Purchase Order {po_id} - Partial Shipment Details

Hello Vigil Procurement,

Due to component shortages, we were unable to fulfill the entire quantity for PO {po_id} in a single run. We have shipped 50% of the ordered units today (Tracking: TRK-9982). 

The remaining balance is scheduled to be manufactured next week and will ship immediately after. Let us know if this works.

Best,
Production Lead, {supplier}"""
        else:
            return f"""Subject: Re: Purchase Order {po_id} - Order Status Update

Hello,

Thank you for your email. We are currently reviewing the status of PO {po_id} with our warehouse. We have experienced some general backlog but expect to have a firm ship date for you by tomorrow morning.

Regards,
Account Operations, {supplier}"""

    # 3. Check if it's an audit explanation
    elif "check triggered:" in user_lower:
        check_name = "general_check"
        for c in ["check_price_deviation", "check_exact_duplicate", "check_split_invoicing", 
                  "check_near_identical", "check_round_numbers", "check_po_reference", 
                  "check_spend_concentration", "check_new_supplier_large", "check_sequential_timing", 
                  "check_invoice_exceeds_po"]:
            if c in user_lower:
                check_name = c
                break

        invoice = "INV-XXXX"
        for word in user.split():
            if "INV-" in word:
                invoice = word.strip(".,()[]{}")

        supplier = "Supplier"
        if "supplier:" in user_lower:
            parts = user.split("Supplier:")
            if len(parts) > 1:
                supplier = parts[1].split("\n")[0].strip()

        amount = "the invoice amount"
        if "amount:" in user_lower:
            parts = user.split("amount:")
            if len(parts) > 1:
                amount = parts[1].split("\n")[0].strip()

        if check_name == "check_price_deviation":
            return f"[LOCAL AI OFFLINE FALLBACK] Invoice {invoice} from {supplier} has a unit price that is significantly higher (+34%) than the historical average price. This represents a substantial deviation from contracted rates. Immediate pricing audit is recommended."
        elif check_name == "check_exact_duplicate":
            return f"[LOCAL AI OFFLINE FALLBACK] Duplicate Invoice Flagged. Invoice {invoice} from {supplier} matching {amount} was found to share the exact same amount and date as another invoice in the database. This indicates potential duplicate billing."
        elif check_name == "check_split_invoicing":
            return f"[LOCAL AI OFFLINE FALLBACK] Split Invoicing Pattern. Multiple invoices (amounting to {amount}) were created for the same Purchase Order from {supplier}. This pattern is typically used to bypass manager spending limits (e.g., $10,000 threshold)."
        elif check_name == "check_near_identical":
            return f"[LOCAL AI OFFLINE FALLBACK] Near-Identical Billing. Two invoices from {supplier} are within pennies of each other ($4,999.97 and $5,000.03) within the same week. This could represent split charges to evade single-transaction review thresholds."
        elif check_name == "check_round_numbers":
            return f"[LOCAL AI OFFLINE FALLBACK] Suspicious Round Numbers. {supplier} has issued invoice {invoice} for exactly {amount} with no detailed line-item breakdown. Round-number invoices without detailed itemization are high-risk indicators for compliance audits."
        elif check_name == "check_po_reference":
            return f"[LOCAL AI OFFLINE FALLBACK] Invalid PO Reference. Invoice {invoice} references a Purchase Order that does not exist in our systems. This represents a control breakdown where work may have been commissioned outside approved channels."
        elif check_name == "check_spend_concentration":
            return f"[LOCAL AI OFFLINE FALLBACK] Spend Concentration Risk. {supplier} represents over 60% of our total spend in this category this quarter. This high reliance on a single vendor increases supply chain and pricing leverage risk."
        elif check_name == "check_new_supplier_large":
            return f"[LOCAL AI OFFLINE FALLBACK] New Vendor Risk. First-ever invoice from new supplier {supplier} is {amount}, exceeding the high-value risk threshold of $15,000. Standard verification of bank details and delivery terms should be completed."
        elif check_name == "check_sequential_timing":
            return f"[LOCAL AI OFFLINE FALLBACK] Rapid Billing Sequence. Multiple invoices were received from {supplier} in rapid succession (within 72 hours). This can indicate split invoicing or billing department errors."
        elif check_name == "check_invoice_exceeds_po":
            return f"[LOCAL AI OFFLINE FALLBACK] Budget Overrun. Invoice {invoice} total of {amount} exceeds the authorized purchase order value. This represents an unapproved price or quantity increase that requires reconciliation."
        else:
            return f"[LOCAL AI OFFLINE FALLBACK] General Anomaly. Invoice {invoice} from {supplier} for {amount} triggered {check_name}. Human review is recommended to evaluate standard compliance and verify charges."

    # 4. Check if it's RAG question synthesis
    elif "context:" in user_lower and "question:" in user_lower:
        # Parse context to give a basic logical response
        lines = user.split("\n")
        context_text = ""
        question_text = ""
        in_question = False
        for line in lines:
            if "question:" in line.lower():
                in_question = True
                question_text = line
            elif in_question:
                question_text += "\n" + line
            else:
                context_text += "\n" + line
                
        # Simple extraction of known plant info to make fallback feel smart
        resp = "[LOCAL RAG SYNTHESIS FALLBACK]\n"
        if "duplicate" in question_text.lower() or "meridian" in question_text.lower():
            resp += "Meridian Logistics has submitted two duplicate invoices (INV-9901 and INV-9902), both for $3,240.00 dated 2024-05-28. This triggers the exact duplicate check and has been escalated [INV-9901][INV-9902]."
        elif "price" in question_text.lower() or "apex" in question_text.lower() or "deviation" in question_text.lower() or "spike" in question_text.lower():
            resp += "Apex Components Ltd (Germany) has a price spike anomaly on INV-8821. Resistors were billed at $0.0603/unit versus their historical average of $0.045/unit (+34% deviation), which is a critical finding [INV-8821]."
        elif "split" in question_text.lower() or "globalparts" in question_text.lower():
            resp += "GlobalParts Inc has been flagged for split invoicing on PO-2024-0012, where a single $28,000 transaction was split into three invoices of $9,333 each (INV-3011, INV-3012, INV-3013) to stay just under the $10,000 management approval limit [INV-3011][INV-3012][INV-3013]."
        elif "near" in question_text.lower() or "nexus" in question_text.lower():
            resp += "Nexus Supply Co is flagged for near-identical invoices INV-7741 ($4,999.97) and INV-7742 ($5,000.03) submitted within 3 days of each other [INV-7741][INV-7742]."
        elif "round" in question_text.lower():
            resp += "GlobalParts Inc has 3 consecutive round-number invoices of exactly $10,000.00 each (INV-3021, INV-3022, INV-3023) without detailed item breakdown [INV-3021]."
        elif "no po" in question_text.lower() or "bluestar" in question_text.lower() or "without po" in question_text.lower():
            resp += "BlueStar Materials has invoiced $7,850.00 via INV-6610 which references a non-existent PO ID (PO-9999) [INV-6610]."
        elif "concentration" in question_text.lower() or "crestline" in question_text.lower():
            resp += "Crestline Tech accounts for 61% of all electronics category spend this quarter ($61,000 out of $100,000), which exceeds the 50% spend concentration limit."
        elif "vantage" in question_text.lower() or "new supplier" in question_text.lower() or "large invoice" in question_text.lower():
            resp += "Vantage Freight, a new freight supplier, submitted an initial invoice INV-5501 of $22,500 with no prior billing history. This triggers the large first-time invoice risk [INV-5501]."
        else:
            resp += "Based on the database records, several anomalies require review, including duplicate invoices from Meridian Logistics [INV-9901], unit price increases from Apex Components [INV-8821], and split invoicing from GlobalParts [INV-3011]. Please review the primary Audit screen for action."
        return resp

    return f"[LOCAL AI OFFLINE FALLBACK] Received chat request. DeepSeek API key is not configured, but the action was logged. System prompt: {system[:60]}... User prompt: {user[:60]}..."
