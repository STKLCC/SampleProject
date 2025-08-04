### Running on docker desktop

+ Run, command, stop
```shell
docker run --name my-redis -p 6379:6379 -d redis
docker exec -it my-redis redis-cli
docker stop my-redis
```

### Running on Kubernetes Cluster

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: redis
  namespace: s
  labels:
    app: redis
spec:
  containers:
  - name: redis
    image: redis:latest
    ports:
    - containerPort: 6379
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: s
spec:
  selector:
    app: redis
  ports:
  - protocol: TCP
    port: 6379
    targetPort: 6379

```

```shell
kubectl apply -f redis.yaml
kubectl get pods -l app=redis -n s
kubectl get svc redis -n s
kubectl port-forward svc/redis 6379:6379 -n s 
```