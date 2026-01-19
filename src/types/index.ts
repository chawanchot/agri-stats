export type CropType = {
    name: string;
    data: CropDetailType[];
};

export type CropDetailType = {
    crop: string;
    harvest_area: number;
    planted_area: number;
    province: string;
    year: number;
    yield_per_rai: number;
    yield_ton: number;
};

export type OptionType = {
    value: string;
    label: string;
    children?: OptionType[];
};

export type PriceType = {
    day_price: string;
    product_category: string;
    product_name: string;
    unit: string;
};

export type LocationType = {
    location: LatLngType;
    name: string;
    province: string;
    productList: ProductListType[];
};

export type LatLngType = {
    lat: number;
    lng: number;
};

export type ProductListType = {
    name: string;
    price: number;
    unit: string;
};

export type PopupStatusType = Record<string, boolean>;
