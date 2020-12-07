#!/bin/bash

kubectl delete -f application-secrets.yaml
kubectl delete -f postgres-deployment.yaml
kubectl delete -f adminer-deployment.yaml
