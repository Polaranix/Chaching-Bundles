use shopify_function::prelude::*;
use shopify_function::Result;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default, PartialEq)]
#[serde(rename_all(deserialize = "camelCase"))]
struct Config {
    bundles: Vec<Bundle>,
}

#[derive(Serialize, Deserialize, PartialEq)]
#[serde(rename_all(deserialize = "camelCase"))]
struct Bundle {
    id: String,
    r#type: BundleType,
    discount_type: DiscountType,
    discount_value: f64,
    min_qty: Option<i32>,
    items: Vec<BundleItem>,
}

#[derive(Serialize, Deserialize, PartialEq)]
#[serde(rename_all(deserialize = "camelCase"))]
enum BundleType {
    Fixed,
    MixMatch,
}

#[derive(Serialize, Deserialize, PartialEq)]
#[serde(rename_all(deserialize = "camelCase"))]
enum DiscountType {
    Percent,
    Amount,
}

#[derive(Serialize, Deserialize, PartialEq)]
#[serde(rename_all(deserialize = "camelCase"))]
struct BundleItem {
    variant_gid: String,
    quantity: i32,
}

#[shopify_function_target(query_path = "src/run.graphql", schema_path = "schema.graphql")]
fn run(input: ResponseData) -> Result<FunctionResult> {
    let no_changes = DiscountApplicationStrategy::First(vec![]);
    
    let config: Config = match input.discount_node.configuration {
        Some(config_value) => serde_json::from_str(&config_value.to_string())
            .map_err(|_| "Failed to parse configuration")?,
        None => return Ok(FunctionResult { discounts: vec![], discount_application_strategy: no_changes }),
    };

    if config.bundles.is_empty() {
        return Ok(FunctionResult { discounts: vec![], discount_application_strategy: no_changes });
    }

    let cart_lines = &input.cart.lines;
    let mut discounts = vec![];

    // Check each bundle for matches
    for bundle in &config.bundles {
        let applicable_lines = find_applicable_lines(&bundle, cart_lines);
        
        if !applicable_lines.is_empty() {
            let discount = create_bundle_discount(&bundle, applicable_lines)?;
            discounts.push(discount);
        }
    }

    Ok(FunctionResult {
        discounts,
        discount_application_strategy: DiscountApplicationStrategy::First(vec![]),
    })
}

fn find_applicable_lines(bundle: &Bundle, cart_lines: &[CartLine]) -> Vec<&CartLine> {
    match bundle.r#type {
        BundleType::Fixed => find_fixed_bundle_lines(bundle, cart_lines),
        BundleType::MixMatch => find_mix_match_bundle_lines(bundle, cart_lines),
    }
}

fn find_fixed_bundle_lines(bundle: &Bundle, cart_lines: &[CartLine]) -> Vec<&CartLine> {
    let mut applicable_lines = vec![];
    
    // Check if all required items are present with sufficient quantities
    for bundle_item in &bundle.items {
        if let Some(cart_line) = cart_lines.iter().find(|line| {
            line.merchandise.id == bundle_item.variant_gid && 
            line.quantity >= bundle_item.quantity
        }) {
            applicable_lines.push(cart_line);
        } else {
            // If any required item is missing or insufficient, no discount applies
            return vec![];
        }
    }
    
    applicable_lines
}

fn find_mix_match_bundle_lines(bundle: &Bundle, cart_lines: &[CartLine]) -> Vec<&CartLine> {
    let min_qty = bundle.min_qty.unwrap_or(2);
    let allowed_variants: Vec<&String> = bundle.items.iter().map(|item| &item.variant_gid).collect();
    
    let mut applicable_lines = vec![];
    let mut total_quantity = 0;
    
    for cart_line in cart_lines {
        if allowed_variants.contains(&&cart_line.merchandise.id) {
            applicable_lines.push(cart_line);
            total_quantity += cart_line.quantity;
        }
    }
    
    if total_quantity >= min_qty {
        applicable_lines
    } else {
        vec![]
    }
}

fn create_bundle_discount(bundle: &Bundle, applicable_lines: Vec<&CartLine>) -> Result<Discount> {
    let targets = applicable_lines
        .into_iter()
        .map(|line| Target::CartLine(CartLineTarget {
            id: line.id.clone(),
            quantity: None,
        }))
        .collect();

    let value = match bundle.discount_type {
        DiscountType::Percent => Value::Percentage(Percentage {
            value: bundle.discount_value.to_string(),
        }),
        DiscountType::Amount => Value::FixedAmount(FixedAmount {
            amount: bundle.discount_value.to_string(),
            applies_to_each_item: Some(false),
        }),
    };

    Ok(Discount {
        message: Some(format!("Bundle discount: {}", bundle.id)),
        targets,
        value,
        conditions: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fixed_bundle_discount() {
        let bundle = Bundle {
            id: "test-bundle".to_string(),
            r#type: BundleType::Fixed,
            discount_type: DiscountType::Percent,
            discount_value: 20.0,
            min_qty: None,
            items: vec![
                BundleItem {
                    variant_gid: "gid://shopify/ProductVariant/1".to_string(),
                    quantity: 1,
                },
                BundleItem {
                    variant_gid: "gid://shopify/ProductVariant/2".to_string(),
                    quantity: 1,
                },
            ],
        };

        let cart_lines = vec![
            CartLine {
                id: "line1".to_string(),
                quantity: 1,
                merchandise: Merchandise {
                    id: "gid://shopify/ProductVariant/1".to_string(),
                },
            },
            CartLine {
                id: "line2".to_string(),
                quantity: 1,
                merchandise: Merchandise {
                    id: "gid://shopify/ProductVariant/2".to_string(),
                },
            },
        ];

        let applicable_lines = find_applicable_lines(&bundle, &cart_lines);
        assert_eq!(applicable_lines.len(), 2);
    }

    #[test]
    fn test_mix_match_bundle_discount() {
        let bundle = Bundle {
            id: "test-mix-match".to_string(),
            r#type: BundleType::MixMatch,
            discount_type: DiscountType::Amount,
            discount_value: 5.0,
            min_qty: Some(2),
            items: vec![
                BundleItem {
                    variant_gid: "gid://shopify/ProductVariant/1".to_string(),
                    quantity: 1,
                },
                BundleItem {
                    variant_gid: "gid://shopify/ProductVariant/2".to_string(),
                    quantity: 1,
                },
                BundleItem {
                    variant_gid: "gid://shopify/ProductVariant/3".to_string(),
                    quantity: 1,
                },
            ],
        };

        let cart_lines = vec![
            CartLine {
                id: "line1".to_string(),
                quantity: 1,
                merchandise: Merchandise {
                    id: "gid://shopify/ProductVariant/1".to_string(),
                },
            },
            CartLine {
                id: "line2".to_string(),
                quantity: 2,
                merchandise: Merchandise {
                    id: "gid://shopify/ProductVariant/3".to_string(),
                },
            },
        ];

        let applicable_lines = find_applicable_lines(&bundle, &cart_lines);
        assert_eq!(applicable_lines.len(), 2); // Both lines qualify
    }

    #[test]
    fn test_insufficient_quantity() {
        let bundle = Bundle {
            id: "test-bundle".to_string(),
            r#type: BundleType::Fixed,
            discount_type: DiscountType::Percent,
            discount_value: 20.0,
            min_qty: None,
            items: vec![
                BundleItem {
                    variant_gid: "gid://shopify/ProductVariant/1".to_string(),
                    quantity: 2, // Requires 2, but cart only has 1
                },
            ],
        };

        let cart_lines = vec![
            CartLine {
                id: "line1".to_string(),
                quantity: 1, // Only 1 in cart
                merchandise: Merchandise {
                    id: "gid://shopify/ProductVariant/1".to_string(),
                },
            },
        ];

        let applicable_lines = find_applicable_lines(&bundle, &cart_lines);
        assert_eq!(applicable_lines.len(), 0); // Should not qualify
    }
}
