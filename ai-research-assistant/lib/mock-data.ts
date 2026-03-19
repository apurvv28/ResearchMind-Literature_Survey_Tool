export type Paper = {
  id: string;
  title: string;
  authors: string;
  year: number;
  url: string;
};

export type ResearchRecord = {
  topic: string;
  summary: string[];
  keyFindings: string[];
  keyPapers: Paper[];
  researchGaps: string[];
};

export const trendingTopics = [
  "Federated Learning Security",
  "Diffusion Models in Medical Imaging",
  "Reinforcement Learning in Robotics",
  "Graph Neural Networks in Drug Discovery",
  "Multimodal LLM Evaluation",
  "Causal Representation Learning",
];

export const historyTopics = [
  "Federated Learning Security",
  "Graph Neural Networks in Chemistry",
  "Self-Supervised Learning",
  "Diffusion Models in Medical Imaging",
  "Reinforcement Learning in Robotics",
];

const researchDatabase: Record<string, ResearchRecord> = {
  "federated learning security": {
    topic: "Federated Learning Security",
    summary: [
      "Federated learning has become a practical paradigm for privacy-preserving machine learning by keeping raw data on local clients while sharing model updates. Current research focuses on balancing privacy guarantees, communication efficiency, and robustness against adversarial participants.",
      "A major direction is secure aggregation and differential privacy, where update encryption and calibrated noise reduce leakage risk from gradient inversion attacks. Recent benchmarks show that stronger privacy settings can degrade model utility, especially in non-IID data regimes common in edge scenarios.",
      "The field is increasingly moving toward adaptive trust mechanisms, combining anomaly detection, reputation scoring, and robust aggregation to mitigate poisoning and backdoor threats while preserving convergence for large-scale deployments.",
    ],
    keyFindings: [
      "Gradient leakage remains possible without secure aggregation, even when no raw data is shared.",
      "Robust aggregation methods improve resilience to poisoning but often increase computation overhead.",
      "Personalization layers can recover accuracy losses caused by privacy constraints in heterogeneous clients.",
    ],
    keyPapers: [
      {
        id: "pap-1",
        title: "The Security of Federated Learning: Threats, Defenses, and Open Problems",
        authors: "Li, Chen, and Suresh",
        year: 2023,
        url: "https://arxiv.org/abs/2302.00000",
      },
      {
        id: "pap-2",
        title: "Practical Secure Aggregation for Privacy-Preserving ML",
        authors: "Bonawitz et al.",
        year: 2017,
        url: "https://arxiv.org/abs/1611.04482",
      },
      {
        id: "pap-3",
        title: "Backdoor Attacks in Federated Learning Systems",
        authors: "Bagdasaryan et al.",
        year: 2020,
        url: "https://arxiv.org/abs/1807.00459",
      },
    ],
    researchGaps: [
      "Standardized security benchmarks across realistic non-IID settings are still limited.",
      "Defenses against adaptive, stealthy backdoor attacks remain brittle.",
      "Formal trade-off analysis between privacy budgets and robustness is incomplete.",
    ],
  },
};

export function getResearchRecord(topic: string): ResearchRecord {
  const normalized = topic.trim().toLowerCase();
  const fallbackTopic = topic.trim() || "AI Research Topic";

  if (researchDatabase[normalized]) {
    return researchDatabase[normalized];
  }

  return {
    topic: fallbackTopic,
    summary: [
      `${fallbackTopic} is an active research area with rapid growth in publications, benchmark datasets, and application-oriented studies. The literature converges on practical deployment challenges while continuing to improve core model quality.`,
      "Recent papers emphasize reliability, evaluation rigor, and domain transfer. Across studies, stronger baselines and larger datasets improve headline metrics, but reproducibility and robustness remain uneven across tasks and environments.",
      "The next wave of work is likely to combine efficient architectures with stronger uncertainty estimation and human-centered evaluation to bridge lab performance and real-world impact.",
    ],
    keyFindings: [
      "Methodological improvements are accelerating, but evaluation standards vary across subfields.",
      "Hybrid approaches combining multiple model families are outperforming single-technique pipelines.",
      "Data quality and domain adaptation are consistently stronger predictors of downstream success than model size alone.",
    ],
    keyPapers: [
      {
        id: "pap-a",
        title: `A Survey of ${fallbackTopic}`,
        authors: "Smith and Rao",
        year: 2024,
        url: "https://arxiv.org/",
      },
      {
        id: "pap-b",
        title: "Benchmarking Modern AI Methods in Realistic Settings",
        authors: "Garcia et al.",
        year: 2023,
        url: "https://arxiv.org/",
      },
      {
        id: "pap-c",
        title: "Toward Reliable and Interpretable AI Systems",
        authors: "Khan, Du, and Patel",
        year: 2022,
        url: "https://arxiv.org/",
      },
    ],
    researchGaps: [
      "Longitudinal studies validating performance in changing real-world environments are limited.",
      "Cross-domain generalization is underexplored for low-resource settings.",
      "Few studies report cost, energy, and reproducibility metrics together.",
    ],
  };
}
