---
tags:
- setfit
- sentence-transformers
- text-classification
- generated_from_setfit_trainer
widget:
- text: tds debit corporate tax settlement income dept
- text: imps payment received web development services
- text: neft transfer from client corp inflow dev
- text: customs duty excise clearance charge online
- text: airtel post paid mobile broadband utility payment
metrics:
- accuracy
pipeline_tag: text-classification
library_name: setfit
inference: true
base_model: sentence-transformers/all-MiniLM-L6-v2
---

# SetFit with sentence-transformers/all-MiniLM-L6-v2

This is a [SetFit](https://github.com/huggingface/setfit) model that can be used for Text Classification. This SetFit model uses [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) as the Sentence Transformer embedding model. A [LogisticRegression](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html) instance is used for classification.

The model has been trained using an efficient few-shot learning technique that involves:

1. Fine-tuning a [Sentence Transformer](https://www.sbert.net) with contrastive learning.
2. Training a classification head with features from the fine-tuned Sentence Transformer.

## Model Details

### Model Description
- **Model Type:** SetFit
- **Sentence Transformer body:** [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- **Classification head:** a [LogisticRegression](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html) instance
- **Maximum Sequence Length:** 256 tokens
- **Number of Classes:** 5 classes
<!-- - **Training Dataset:** [Unknown](https://huggingface.co/datasets/unknown) -->
<!-- - **Language:** Unknown -->
<!-- - **License:** Unknown -->

### Model Sources

- **Repository:** [SetFit on GitHub](https://github.com/huggingface/setfit)
- **Paper:** [Efficient Few-Shot Learning Without Prompts](https://arxiv.org/abs/2209.11055)
- **Blogpost:** [SetFit: Efficient Few-Shot Learning Without Prompts](https://huggingface.co/blog/setfit)

### Model Labels
| Label            | Examples                                                                                                                                                                                 |
|:-----------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Revenue Inflows  | <ul><li>'neft transfer from client corp inflow dev'</li><li>'imps payment received web development services'</li><li>'wire credit customer balance payment invoice'</li></ul>            |
| Utilities        | <ul><li>'upi out to bescom electricity bill bangalore'</li><li>'airtel post paid mobile broadband utility payment'</li><li>'wbseb electric bill remittance online transaction'</li></ul> |
| Salaries         | <ul><li>'monthly payroll debit structural employee transfer'</li><li>'salary credit batch processed hdfc automation'</li><li>'wages distribution contract staff operations'</li></ul>    |
| Compliance/Taxes | <ul><li>'gst compliance tax return outflow ref'</li><li>'tds debit corporate tax settlement income dept'</li><li>'customs duty excise clearance charge online'</li></ul>                 |
| Vendor Outflows  | <ul><li>'purchase raw steel industrial manufacturing mats'</li><li>'vendor payout logisctics supply chain delivery'</li><li>'raw inventory procurement local wholesale inc'</li></ul>    |

## Uses

### Direct Use for Inference

First install the SetFit library:

```bash
pip install setfit
```

Then you can load this model and run inference.

```python
from setfit import SetFitModel

# Download from the 🤗 Hub
model = SetFitModel.from_pretrained("setfit_model_id")
# Run inference
preds = model("neft transfer from client corp inflow dev")
```

<!--
### Downstream Use

*List how someone could finetune this model on their own dataset.*
-->

<!--
### Out-of-Scope Use

*List how the model may foreseeably be misused and address what users ought not to do with the model.*
-->

<!--
## Bias, Risks and Limitations

*What are the known or foreseeable issues stemming from this model? You could also flag here known failure cases or weaknesses of the model.*
-->

<!--
### Recommendations

*What are recommendations with respect to the foreseeable issues? For example, filtering explicit content.*
-->

## Training Details

### Training Set Metrics
| Training set | Min | Median | Max |
|:-------------|:----|:-------|:----|
| Word count   | 5   | 6.2    | 7   |

| Label            | Training Sample Count |
|:-----------------|:----------------------|
| Vendor Outflows  | 3                     |
| Revenue Inflows  | 3                     |
| Utilities        | 3                     |
| Salaries         | 3                     |
| Compliance/Taxes | 3                     |

### Training Hyperparameters
- batch_size: (16, 16)
- num_epochs: (3, 3)
- max_steps: -1
- sampling_strategy: oversampling
- body_learning_rate: (2e-05, 1e-05)
- head_learning_rate: 0.01
- loss: CosineSimilarityLoss
- distance_metric: cosine_distance
- margin: 0.25
- end_to_end: False
- use_amp: True
- warmup_proportion: 0.1
- l2_weight: 0.01
- seed: 42
- eval_max_steps: -1
- load_best_model_at_end: False

### Training Results
| Epoch  | Step | Training Loss | Validation Loss |
|:------:|:----:|:-------------:|:---------------:|
| 0.0833 | 1    | 0.151         | -               |

### Framework Versions
- Python: 3.12.13
- SetFit: 1.1.3
- Sentence Transformers: 3.3.1
- Transformers: 4.46.0
- PyTorch: 2.10.0+cu128
- Datasets: 4.8.5
- Tokenizers: 0.20.3

## Citation

### BibTeX
```bibtex
@article{https://doi.org/10.48550/arxiv.2209.11055,
    doi = {10.48550/ARXIV.2209.11055},
    url = {https://arxiv.org/abs/2209.11055},
    author = {Tunstall, Lewis and Reimers, Nils and Jo, Unso Eun Seo and Bates, Luke and Korat, Daniel and Wasserblat, Moshe and Pereg, Oren},
    keywords = {Computation and Language (cs.CL), FOS: Computer and information sciences, FOS: Computer and information sciences},
    title = {Efficient Few-Shot Learning Without Prompts},
    publisher = {arXiv},
    year = {2022},
    copyright = {Creative Commons Attribution 4.0 International}
}
```

<!--
## Glossary

*Clearly define terms in order to be accessible across audiences.*
-->

<!--
## Model Card Authors

*Lists the people who create the model card, providing recognition and accountability for the detailed work that goes into its construction.*
-->

<!--
## Model Card Contact

*Provides a way for people who have updates to the Model Card, suggestions, or questions, to contact the Model Card authors.*
-->