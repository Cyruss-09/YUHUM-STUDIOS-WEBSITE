-- Active: 1784321332673@@127.0.0.1@5432@Yuhum.Studio.db
CREATE TABLE bookings(
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
    user_email varchar(255) ,
    PRIMARY KEY(id) 
);

CREATE TABLE reviews(
     id SERIAL NOT NULL,
    overall_rating integer NOT NULL,
    equipment_ease integer NOT NULL,
    room_privacy integer NOT NULL,
    props_selection integer NOT NULL,
    favorite_backdrop varchar(50),
    comments text,
    recommend boolean,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_email varchar(255) ,
    PRIMARY KEY(id) ,
    CONSTRAINT reviews_overall_rating_check CHECK ((overall_rating >= 0) AND (overall_rating <= 5)),
    CONSTRAINT reviews_equipment_ease_check CHECK ((equipment_ease >= 0) AND (equipment_ease <= 5)),
    CONSTRAINT reviews_room_privacy_check CHECK ((room_privacy >= 0) AND (room_privacy <= 5)),
    CONSTRAINT reviews_props_selection_check CHECK ((props_selection >= 0) AND (props_selection <= 5)) 
);

