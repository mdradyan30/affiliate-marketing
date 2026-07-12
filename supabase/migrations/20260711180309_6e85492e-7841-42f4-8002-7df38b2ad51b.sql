
ALTER TABLE public.posts ADD CONSTRAINT posts_author_profile_fk FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_author_profile_fk FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
