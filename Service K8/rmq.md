### RMQ k8

```shell
kubectl apply -f rmq.yaml
kubectl get pods -l app=rabbitmq -n s
kubectl get svc rabbitmq -n s
kubectl port-forward svc/rabbitmq 15672:15672 -n s 
```