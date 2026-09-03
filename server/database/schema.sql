-- Active: 1784321332673@@127.0.0.1@5432@Yuhum.Studio.db
CREATE TABLE bookings (
    id SERIAL NOT NULL,
    package_id varchar(50) NOT NULL,
    package_title varchar(100) NOT NULL,
    base_price varchar(20) NOT NULL,
    studio varchar(50) NOT NULL,
    booking_date varchar(50) NOT NULL,
    day_of_week varchar(20) NOT NULL,
    booking_time varchar(20) NOT NULL,
    add_ons text[] DEFAULT '{}'::text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "firstName" varchar(50),
    "lastName" varchar(50),
    phone varchar(20),
    email varchar(255),
    "termsAccepted" boolean,
    "findUs" varchar(50),
    "paymentMode" varchar(50),
    "couponCode" varchar(50),
    PRIMARY KEY(id)
);

CREATE TABLE reviews (
    id SERIAL NOT NULL,
    overall_rating integer NOT NULL,
    equipment_ease integer NOT NULL,
    room_privacy integer NOT NULL,
    props_selection integer NOT NULL,
    favorite_backdrop varchar(50),
    comments text,
    recommend boolean,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_email varchar(255),
    PRIMARY KEY (id),
    CONSTRAINT reviews_overall_rating_check CHECK (
        (overall_rating >= 0)
        AND (overall_rating <= 5)
    ),
    CONSTRAINT reviews_equipment_ease_check CHECK (
        (equipment_ease >= 0)
        AND (equipment_ease <= 5)
    ),
    CONSTRAINT reviews_room_privacy_check CHECK (
        (room_privacy >= 0)
        AND (room_privacy <= 5)
    ),
    CONSTRAINT reviews_props_selection_check CHECK (
        (props_selection >= 0)
        AND (props_selection <= 5)
    )
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user' | 'admin'
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE promo_codes(
     id SERIAL NOT NULL,
    code varchar(50) NOT NULL,
    discount_type varchar(20) NOT NULL DEFAULT 'percentage'::character varying,
    discount_value numeric NOT NULL,
    min_spend numeric DEFAULT 0,
    max_uses integer,
    used_count integer DEFAULT 0,
    expires_at timestamp without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() ,
    PRIMARY KEY(id) 
);

CREATE UNIQUE INDEX promo_codes_code_key ON public.promo_codes USING btree (code);

CREATE TABLE studio_settings (
    id SERIAL NOT NULL,
    setting_key varchar(100) NOT NULL,
    setting_value jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX studio_settings_setting_key_key ON public.studio_settings USING btree (setting_key);

CREATE TABLE subscribers(
     id SERIAL NOT NULL,
    email varchar(255) NOT NULL,
    subscribed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status varchar(50) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now() ,
    PRIMARY KEY(id) 
);

CREATE UNIQUE INDEX subscribers_email_key ON public.subscribers USING btree (email);