#!/bin/bash

kubectl create -f application-secrets.yaml
kubectl create -f postgres-deployment.yaml
kubectl create -f adminer-deployment.yaml
