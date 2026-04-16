import sys
sys.path.append("/app/services/wallet")
try:
    from lnd_grpc import lightning_pb2 as ln
    resp = ln.AddInvoiceResponse(payment_request="lnbcrt_123", r_hash=b"123")
    print(resp.payment_request)
    
    cb = ln.ChannelBalanceResponse()
    cb.local_balance.sat = 1000
    print(cb.local_balance.sat)
except Exception as e:
    import traceback
    traceback.print_exc()
