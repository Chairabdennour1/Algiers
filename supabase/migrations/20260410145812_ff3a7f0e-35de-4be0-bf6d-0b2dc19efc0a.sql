
ALTER TABLE public.accommodations DROP CONSTRAINT accommodations_type_check;
ALTER TABLE public.accommodations ADD CONSTRAINT accommodations_type_check CHECK (type = ANY (ARRAY['hotel','apartment','guesthouse','hostel','homestay']));
