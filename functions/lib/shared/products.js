const products = {
    'P1': {
        external_id: "P1",
        name: "Pokemon mousepad",
        quantity: 1,
        description: "Red and blue Pokemon mousepad.",
        price: 20
    },
    'P2': {
        external_id: "P2",
        name: "Dragonball mousepad",
        quantity: 1,
        description: "Super Saiyan mousepad.",
        price: 25
    },
    'P3': {
        external_id: "P3",
        name: "One Piece mousepad",
        quantity: 1,
        description: "Luffy and Friend mousepad.",
        price: 30
    },
    'P4': {
        external_id: "P4",
        name: "Power Ranger mousepad",
        quantity: 1,
        description: "Power Ranger mousepade standard size",
        price: 35
    }
}

const genProductItems = (cart) => {
    const productItems = [];
    const currentCartItems = Object.keys(cart);

    const menuCode = Object.keys(products);

    for (const itemCode of currentCartItems) {
        if (menuCode.includes(itemCode)) {
            productItems.push({
                "external_id": itemCode,
                "name": products[itemCode].name,
                "quantity": cart[itemCode],
                "description": products[itemCode].description,
                "currency_amount": {
                    "amount": parseInt(products[itemCode].price),
                    "currency": "PHP"
                }
            })
        }
    }

    return productItems
}

const defaultAdditionalAmount = [
    {
        type: "DISCOUNT",
        currency_amount: {
            "amount": "-10",
            "currency": "PHP"
        }
    },
    {
        type: "SHIPPING",
        currency_amount: {
            "amount": "20",
            "currency": "PHP"
        }
    },
    {
        type: "TAX",
        currency_amount: {
            "amount": "5",
            "currency": "PHP"
        }
    }
]

const default_product_items = [{
    external_id: "P1",
    name: "Pokemon mousepad",
    quantity: 1,
    description: "Red and blue Pokemon mousepad.",
    currency_amount: {
        amount: "20.0",
        currency: "PHP"
    }
}]

module.exports = {
    products: products,
    defaultAdditionalAmount: defaultAdditionalAmount,
    genProductItems: genProductItems,
    default_product_items: default_product_items
}