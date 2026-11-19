-- Seed the in-app provisional curriculum index for all 12 grades.
-- This data is navigational only. It is NOT a verified national syllabus or edition.
-- Editors must confirm authority, region, school year and textbook edition before creating published lessons.

insert into public.education_stages (slug,name,sort_order)
values ('basic','التعليم الأساسي',1),('secondary','التعليم الثانوي',2)
on conflict (slug) do update set name=excluded.name,sort_order=excluded.sort_order;

insert into public.grades (stage_id,slug,name,grade_number,sort_order)
select st.id,v.slug,v.name,v.grade_number,v.sort_order
from (values
  ('grade-1','الصف الأول الأساسي','basic',1,1),
  ('grade-2','الصف الثاني الأساسي','basic',2,2),
  ('grade-3','الصف الثالث الأساسي','basic',3,3),
  ('grade-4','الصف الرابع الأساسي','basic',4,4),
  ('grade-5','الصف الخامس الأساسي','basic',5,5),
  ('grade-6','الصف السادس الأساسي','basic',6,6),
  ('grade-7','الصف السابع الأساسي','basic',7,7),
  ('grade-8','الصف الثامن الأساسي','basic',8,8),
  ('grade-9','الصف التاسع الأساسي','basic',9,9),
  ('grade-10','الصف الأول الثانوي','secondary',10,10),
  ('grade-11','الصف الثاني الثانوي','secondary',11,11),
  ('grade-12','الصف الثالث الثانوي','secondary',12,12)
) as v(slug,name,stage_slug,grade_number,sort_order)
join public.education_stages st on st.slug=v.stage_slug
on conflict (slug) do update
set stage_id=excluded.stage_id,name=excluded.name,grade_number=excluded.grade_number,sort_order=excluded.sort_order;

insert into public.tracks (slug,name,sort_order)
values
  ('general','التعليم الأساسي / المقررات العامة',1),
  ('scientific','القسم العلمي',2),
  ('literary','القسم الأدبي',3)
on conflict (slug) do update set name=excluded.name,sort_order=excluded.sort_order;

insert into public.subjects (slug,name,sort_order)
values
  ('arabic','اللغة العربية',1),
  ('mathematics','الرياضيات',2),
  ('science','العلوم',3),
  ('quran-islamic','القرآن الكريم والتربية الإسلامية',4),
  ('social-studies','الاجتماعيات',5),
  ('islamic-education','التربية الإسلامية',6),
  ('quran','القرآن الكريم',7),
  ('history','التاريخ',8),
  ('geography','الجغرافيا',9),
  ('national-education','التربية الوطنية',10),
  ('english','اللغة الإنجليزية',11),
  ('biology','الأحياء',12),
  ('faith','الإيمان',13),
  ('computer','الحاسوب',14),
  ('hadith-fiqh','الحديث والفقه',15),
  ('prophetic-biography','السيرة النبوية',16),
  ('physics','الفيزياء',17),
  ('chemistry','الكيمياء',18),
  ('reading','القراءة',19),
  ('grammar','النحو والصرف',20),
  ('texts','النصوص',21),
  ('yemeni-society','المجتمع اليمني',22),
  ('mathematics-scientific','الرياضيات — علمي',23),
  ('mathematics-literary','الرياضيات — أدبي',24),
  ('economics','الاقتصاد',25),
  ('sociology','علم الاجتماع',26),
  ('philosophy','الفلسفة',27),
  ('logic','المنطق',28),
  ('psychology','علم النفس',29),
  ('map-science','علم الخرائط',30)
on conflict (slug) do update set name=excluded.name,sort_order=excluded.sort_order,is_active=true;

insert into public.grade_tracks (grade_id,track_id)
select g.id,t.id
from (values
  ('grade-1','basic','general'),
  ('grade-2','basic','general'),
  ('grade-3','basic','general'),
  ('grade-4','basic','general'),
  ('grade-5','basic','general'),
  ('grade-6','basic','general'),
  ('grade-7','basic','general'),
  ('grade-8','basic','general'),
  ('grade-9','basic','general'),
  ('grade-10','secondary','general'),
  ('grade-11','secondary','scientific'),
  ('grade-11','secondary','literary'),
  ('grade-12','secondary','scientific'),
  ('grade-12','secondary','literary')
) as v(grade_slug,track_slug,track_name)
join public.grades g on g.slug=v.grade_slug
join public.tracks t on t.slug=v.track_slug
on conflict (grade_id,track_id) do nothing;

-- A named, explicit provisional version prevents the UI catalogue from masquerading as a verified current edition.
insert into public.syllabus_versions (title,school_year,edition_label,source_note)
select
  'الفهرس الأولي للمواد — قيد التحقق وليس طبعة معتمدة',
  null,
  null,
  'فهرس تنقّل أولي مشتق من قائمة التطبيق. يجب التحقق من الجهة التعليمية والمحافظة والسنة والطبعة لكل مادة على حدة. لا يُستخدم هذا السجل وحده لإثبات المطابقة مع المنهج الرسمي.'
where not exists (
  select 1 from public.syllabus_versions
  where title='الفهرس الأولي للمواد — قيد التحقق وليس طبعة معتمدة'
);

insert into public.curriculum_subjects (grade_track_id,subject_id,syllabus_version_id,is_active)
select gt.id,s.id,sv.id,true
from (values
  ('grade-1','general','arabic'),
  ('grade-1','general','mathematics'),
  ('grade-1','general','science'),
  ('grade-1','general','quran-islamic'),
  ('grade-2','general','arabic'),
  ('grade-2','general','mathematics'),
  ('grade-2','general','science'),
  ('grade-2','general','quran-islamic'),
  ('grade-3','general','arabic'),
  ('grade-3','general','mathematics'),
  ('grade-3','general','science'),
  ('grade-3','general','quran-islamic'),
  ('grade-3','general','social-studies'),
  ('grade-4','general','arabic'),
  ('grade-4','general','mathematics'),
  ('grade-4','general','science'),
  ('grade-4','general','social-studies'),
  ('grade-4','general','islamic-education'),
  ('grade-4','general','quran'),
  ('grade-5','general','arabic'),
  ('grade-5','general','mathematics'),
  ('grade-5','general','science'),
  ('grade-5','general','history'),
  ('grade-5','general','geography'),
  ('grade-5','general','national-education'),
  ('grade-5','general','islamic-education'),
  ('grade-5','general','quran'),
  ('grade-6','general','arabic'),
  ('grade-6','general','mathematics'),
  ('grade-6','general','science'),
  ('grade-6','general','history'),
  ('grade-6','general','geography'),
  ('grade-6','general','national-education'),
  ('grade-6','general','islamic-education'),
  ('grade-6','general','quran'),
  ('grade-7','general','arabic'),
  ('grade-7','general','mathematics'),
  ('grade-7','general','science'),
  ('grade-7','general','history'),
  ('grade-7','general','geography'),
  ('grade-7','general','national-education'),
  ('grade-7','general','islamic-education'),
  ('grade-7','general','quran'),
  ('grade-7','general','english'),
  ('grade-8','general','arabic'),
  ('grade-8','general','mathematics'),
  ('grade-8','general','science'),
  ('grade-8','general','history'),
  ('grade-8','general','geography'),
  ('grade-8','general','national-education'),
  ('grade-8','general','islamic-education'),
  ('grade-8','general','quran'),
  ('grade-8','general','english'),
  ('grade-9','general','arabic'),
  ('grade-9','general','mathematics'),
  ('grade-9','general','science'),
  ('grade-9','general','history'),
  ('grade-9','general','geography'),
  ('grade-9','general','national-education'),
  ('grade-9','general','islamic-education'),
  ('grade-9','general','quran'),
  ('grade-9','general','english'),
  ('grade-10','general','biology'),
  ('grade-10','general','english'),
  ('grade-10','general','faith'),
  ('grade-10','general','history'),
  ('grade-10','general','geography'),
  ('grade-10','general','computer'),
  ('grade-10','general','hadith-fiqh'),
  ('grade-10','general','prophetic-biography'),
  ('grade-10','general','physics'),
  ('grade-10','general','quran'),
  ('grade-10','general','chemistry'),
  ('grade-10','general','reading'),
  ('grade-10','general','grammar'),
  ('grade-10','general','texts'),
  ('grade-10','general','yemeni-society'),
  ('grade-11','scientific','biology'),
  ('grade-11','scientific','english'),
  ('grade-11','scientific','faith'),
  ('grade-11','scientific','history'),
  ('grade-11','scientific','geography'),
  ('grade-11','scientific','computer'),
  ('grade-11','scientific','hadith-fiqh'),
  ('grade-11','scientific','prophetic-biography'),
  ('grade-11','scientific','physics'),
  ('grade-11','scientific','quran'),
  ('grade-11','scientific','chemistry'),
  ('grade-11','scientific','reading'),
  ('grade-11','scientific','grammar'),
  ('grade-11','scientific','texts'),
  ('grade-11','scientific','mathematics-scientific'),
  ('grade-11','literary','english'),
  ('grade-11','literary','faith'),
  ('grade-11','literary','history'),
  ('grade-11','literary','geography'),
  ('grade-11','literary','computer'),
  ('grade-11','literary','hadith-fiqh'),
  ('grade-11','literary','prophetic-biography'),
  ('grade-11','literary','quran'),
  ('grade-11','literary','reading'),
  ('grade-11','literary','grammar'),
  ('grade-11','literary','texts'),
  ('grade-11','literary','mathematics-literary'),
  ('grade-11','literary','economics'),
  ('grade-11','literary','sociology'),
  ('grade-12','scientific','biology'),
  ('grade-12','scientific','english'),
  ('grade-12','scientific','faith'),
  ('grade-12','scientific','history'),
  ('grade-12','scientific','geography'),
  ('grade-12','scientific','hadith-fiqh'),
  ('grade-12','scientific','mathematics-scientific'),
  ('grade-12','scientific','prophetic-biography'),
  ('grade-12','scientific','quran'),
  ('grade-12','scientific','physics'),
  ('grade-12','scientific','chemistry'),
  ('grade-12','scientific','reading'),
  ('grade-12','scientific','grammar'),
  ('grade-12','scientific','texts'),
  ('grade-12','literary','biology'),
  ('grade-12','literary','english'),
  ('grade-12','literary','faith'),
  ('grade-12','literary','history'),
  ('grade-12','literary','geography'),
  ('grade-12','literary','hadith-fiqh'),
  ('grade-12','literary','mathematics-literary'),
  ('grade-12','literary','prophetic-biography'),
  ('grade-12','literary','philosophy'),
  ('grade-12','literary','quran'),
  ('grade-12','literary','logic'),
  ('grade-12','literary','reading'),
  ('grade-12','literary','grammar'),
  ('grade-12','literary','texts'),
  ('grade-12','literary','psychology'),
  ('grade-12','literary','map-science')
) as v(grade_slug,track_slug,subject_slug)
join public.grades g on g.slug=v.grade_slug
join public.tracks t on t.slug=v.track_slug
join public.grade_tracks gt on gt.grade_id=g.id and gt.track_id=t.id
join public.subjects s on s.slug=v.subject_slug
join public.syllabus_versions sv on sv.title='الفهرس الأولي للمواد — قيد التحقق وليس طبعة معتمدة'
on conflict do nothing;
