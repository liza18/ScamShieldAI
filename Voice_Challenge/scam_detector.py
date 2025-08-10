def detect_scam(text: str):
    text_lower = text.lower()

    scam_keywords = [
        # Español
        "dinero", "transferir", "cuenta", "contraseña", "código", "premio", "urgente",
        "tarjeta", "banco", "robo", "estafa", "fraude", "peligro", "alerta", "llamada",
        "pago", "inmediato", "bloqueo", "verificación", "confirmar", "clave", "seguridad",
        "identidad", "riesgo", "infiltración", "phishing", "sospecha", "fraudulento",
        "hackeo", "extorsión", "falso", "ilegal", "denuncia", "bloquear", "comprometido",
        "transferencia", "suplantación", "cobro", "reembolso", "solicitud", "confirmación",
        "error", "acción", "deuda", "víctima", "cobrar",
        # Inglés
        "money", "transfer", "account", "password", "code", "prize", "urgent",
        "card", "bank", "theft", "scam", "fraud", "danger", "alert", "call",
        "payment", "immediate", "block", "verification", "confirm", "key", "security",
        "identity", "risk", "infiltration", "phishing", "suspicion", "fraudulent",
        "hacking", "extortion", "fake", "illegal", "complaint", "block", "compromised",
        "transfer", "impersonation", "charge", "refund", "request", "confirmation",
        "error", "action", "debt", "victim", "charge",
        # Francés
        "argent", "transférer", "compte", "mot de passe", "code", "prix", "urgent",
        "carte", "banque", "vol", "arnaque", "fraude", "danger", "alerte", "appel",
        "paiement", "immédiat", "blocage", "vérification", "confirmer", "clé", "sécurité",
        "identité", "risque", "infiltration", "hameçonnage", "suspicion", "frauduleux",
        "piratage", "extorsion", "faux", "illégal", "plainte", "bloquer", "compromis",
        "transfert", "usurpation", "facturation", "remboursement", "demande", "confirmation",
        "erreur", "action", "dette", "victime", "facturer"
    ]

    suspicious_keywords = [
        # Español
        "problema", "verificar", "alerta", "confirmar", "consulta", "revisar",
        "fallo", "advertencia", "atención", "solicitar", "investigar", "mensaje",
        "notificación", "correo", "alarma", "incidencia", "reporte", "aviso",
        "duda", "error", "sospecha", "precaución", "posible", "excepción",
        # Inglés
        "problem", "verify", "alert", "confirm", "inquiry", "review",
        "failure", "warning", "attention", "request", "investigate", "message",
        "notification", "email", "alarm", "incident", "report", "notice",
        "doubt", "error", "suspicion", "caution", "possible", "exception",
        # Francés
        "problème", "vérifier", "alerte", "confirmer", "demande", "réviser",
        "défaillance", "avertissement", "attention", "demander", "enquêter", "message",
        "notification", "courriel", "alarme", "incident", "rapport", "avis",
        "doute", "erreur", "suspicion", "prudence", "possible", "exception"
    ]

    if any(word in text_lower for word in scam_keywords):
        return "Scam", "Se detectaron palabras relacionadas con estafas."
    elif any(word in text_lower for word in suspicious_keywords):
        return "Suspicious", "Se detectaron palabras sospechosas."
    else:
        return "Safe", "No se detectaron señales sospechosas."
