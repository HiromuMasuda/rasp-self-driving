import requests
import json

@webiopi.macro
def notify_slack():
    webhook_url = "https://hooks.slack.com/services/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"
    webhook_data = json.dumps({'text': u'RasPi self-driving car found something.'})
    requests.post(webhook_url, data = webhook_data)
    print("Sending slack notification DONE.")
