import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { KubectlV31Layer } from '@aws-cdk/lambda-layer-kubectl-v31'; 
import { Construct } from 'constructs';
import { OllamaService } from './ollama-service';

export class MainclasterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Netzwerk erstellen
    const vpc = new ec2.Vpc(this, 'LernVpc', { 
      maxAzs: 2 
    });

    // 2. EKS Cluster definieren
    const cluster = new eks.Cluster(this, 'Ollama-Service', {
      vpc,
      version: eks.KubernetesVersion.V1_31, // Mit Doppelpunkt
      defaultCapacity: 1,
      kubectlLayer: new KubectlV31Layer(this, 'kubectl'), // Die Layer für die K8s-Befehle
    });
    // 1. Das Deployment und den Service als Manifest definieren
      new OllamaService(this, 'OllamaApp', cluster);

    cluster.addHelmChart('NginxIngress', {
      chart: 'ingress-nginx',
      repository: 'https://kubernetes.github.io/ingress-nginx',
      namespace: 'kube-system',
      // Hier ist der Retter: Ein kurzer, manueller Name
      release: 'nginx-ing', 
    });
  }
}
