import { Construct } from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';

export class OllamaService extends Construct {
  constructor(scope: Construct, id: string, cluster: eks.ICluster) {
    super(scope, id);
    cluster.addManifest('OllamaInfrastruktur', {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: { name: 'ai-apps' }
    }, {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { 
        name: 'ollama-service',
        namespace: 'ai-apps'
      },
      spec: {
        type: 'ClusterIP',
        ports: [{ port: 11434, targetPort: 11434 }],
        selector: { app: 'ollama' }
      }
    }, {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { 
        name: 'ollama-dep',
        namespace: 'ai-apps'
      },
      spec: {
        replicas: 1,
        selector: { matchLabels: { app: 'ollama' } },
        template: {
          metadata: { labels: { app: 'ollama' } },
          spec: {
            containers: [{
              name: 'ollama',
              image: 'ollama/ollama:latest',
              ports: [{ containerPort: 11434 }],
              resources: {
                limits: {
                  memory: '6Gi',
                  cpu: '4'
                },
                requests: {
                  memory: '5Gi',
                  cpu: '2'
                }
              }
            }]
          }
        }
      }
    });
  }
}