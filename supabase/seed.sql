-- Ghanaian university-style demonstration reference data. Names are fictional.
insert into public.roles(code,name) values
('student','Student'),('lecturer','Lecturer'),('maintenance','Maintenance Staff'),
('manager','Department Manager'),('admin','System Administrator'),('super_admin','Super Administrator')
on conflict do nothing;

insert into public.permissions(code,description) values
('issue.create','Create issue reports'),('issue.read_all','Read institution issues'),('issue.assign','Assign maintenance work'),
('issue.update_status','Change controlled workflow status'),('issue.verify','Confirm or reopen a resolution'),
('analytics.read','View operational analytics'),('admin.manage','Manage configuration'),('audit.read','View audit logs')
on conflict do nothing;

insert into public.institutions(id,name,code) values
('10000000-0000-0000-0000-000000000001','Akwaaba Technical University','ATU-DEMO')
on conflict do nothing;

insert into public.campuses(id,institution_id,name,code,latitude,longitude) values
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Main Campus','MAIN',5.650600,-0.196200),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','North Campus','NORTH',5.683100,-0.188400),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','City Campus','CITY',5.560000,-0.205000)
on conflict do nothing;

insert into public.departments(id,institution_id,name,code,email) values
('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Electrical Unit','ELEC','electrical@example.edu'),
('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Facilities & Maintenance','FAC','facilities@example.edu'),
('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','ICT Support','ICT','ict@example.edu'),
('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','Environmental Health','ENV','environment@example.edu'),
('30000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','Campus Security','SEC','security@example.edu')
on conflict do nothing;

insert into public.issue_categories(institution_id,name,default_department_id)
select '10000000-0000-0000-0000-000000000001',v.name,v.department_id from (values
('Electrical','30000000-0000-0000-0000-000000000001'::uuid),('Plumbing','30000000-0000-0000-0000-000000000002'::uuid),
('ICT/Internet','30000000-0000-0000-0000-000000000003'::uuid),('Classroom','30000000-0000-0000-0000-000000000002'::uuid),
('Laboratory','30000000-0000-0000-0000-000000000002'::uuid),('Furniture','30000000-0000-0000-0000-000000000002'::uuid),
('Building/Infrastructure','30000000-0000-0000-0000-000000000002'::uuid),('Cleaning','30000000-0000-0000-0000-000000000004'::uuid),
('Waste Management','30000000-0000-0000-0000-000000000004'::uuid),('Security','30000000-0000-0000-0000-000000000005'::uuid),
('Lighting','30000000-0000-0000-0000-000000000001'::uuid),('Other','30000000-0000-0000-0000-000000000002'::uuid)
) as v(name,department_id)
on conflict do nothing;

insert into public.sla_rules(institution_id,priority,response_minutes,resolution_minutes) values
('10000000-0000-0000-0000-000000000001','emergency',15,120),
('10000000-0000-0000-0000-000000000001','critical',30,240),
('10000000-0000-0000-0000-000000000001','high',60,480),
('10000000-0000-0000-0000-000000000001','medium',240,1440),
('10000000-0000-0000-0000-000000000001','low',1440,4320)
on conflict do nothing;
