### Deployment

**Need Statefulset and Persistent Volume For Production**

+ Zookeeper
+ Kafka

```shell
kubectl apply -f zookeeper.yaml
kubectl apply -f kafka.yaml
kubectl get pods -n s
kubectl get svc -n s

kubectl port-forward svc/kafdrop 9000:9000
kubectl port-forward svc/kafka-manager 9000:9000
kubectl port-forward svc/akhq 8080:8080
kubectl port-forward svc/exhibitor 8080:8080
kubectl port-forward svc/zoonavigator 9000:9000

```

AKHQ USE CONFIG

```shell

apiVersion: apps/v1
kind: Deployment
metadata:
  name: akhq
  namespace: s
spec:
  replicas: 1
  selector:
    matchLabels:
      app: akhq
  template:
    metadata:
      labels:
        app: akhq
    spec:
      containers:
      - name: akhq
        image: tchiotludo/akhq:latest
        env:
        - name: AKHQ_CONFIG
          value: |
            akhq:
              connections:
                kafka:
                  properties:
                    bootstrap.servers: "kafka:9092"  # your kafka service
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: akhq
  namespace: s
spec:
  type: ClusterIP
  ports:
  - port: 8080
    targetPort: 8080
  selector:
    app: akhq
```

### UI Zookeeper

+ Kafdrop
+ Kafka Manager
+ AKHQ

### UI Kafka

**Seems like docker image unable, pending to find new alternative**

+ Exhibitor
+ ZooNavigator

