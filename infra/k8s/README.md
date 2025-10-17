# Kubernetes (K8s) Guide for vxture

This document gives a high-level overview for deploying vxture services to Kubernetes (ACK).

## Recommended structure

- Use Helm charts per service (charts/web, charts/api, charts/auth)

- Centralized ingress (NGINX / ALB) + Istio for mesh

## Secrets & Config

- Store secrets in Kubernetes secrets or via external secret manager (阿里云 KMS / Secrets Manager)

## Deploy workflow

1. CI builds image and pushes to registry

2. CD (ArgoCD or Jenkins) updates Helm values and deploys new chart

3. Use Istio virtual service & destination rule to perform canary

## Notes

- Ensure liveness/readiness probes defined

- Mount persistent volumes where needed (Postgres, Elastic)
