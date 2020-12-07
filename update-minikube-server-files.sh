#!/bin/bash

# scp ./server to minikube:/mnt/server-data
scp -rpi $(minikube ssh-key) server/* docker@$(minikube ip):/mnt/server-data

# get the name of the old server pod
OLD=$(kubectl get pods | grep server | awk '{ print $1 }')

echo "OLD = $OLD"

# delete old server pod
kubectl delete -n default pod $OLD &

sleep 3

# get the name of the new server pod
NEW=$(kubectl get pods | grep server | awk '{ print $1 }' | grep -v $OLD)

echo "NEW = $NEW"

# open logs as a stream
kubectl logs -f $NEW
