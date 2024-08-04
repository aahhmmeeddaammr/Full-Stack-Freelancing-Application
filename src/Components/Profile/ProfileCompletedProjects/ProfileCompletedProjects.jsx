import React, { useState } from 'react'
import { Paginator } from 'primereact/paginator';
import Project from './Project/Project'


export default function ProfileCompletedProjects({ Projects }) {

   const [first, setFirst] = useState(0);

   const currentItems = Projects.slice(first, first + 2);

   const onPageChange = (event) => {
      setFirst(event.first);
   }

   return (
      <div className="shadow bg-white p-4 rounded-4 mt-4">
         <h3 className='mb-3'>Completed Projects</h3>
         <div className="projects">
            {
               Projects.length == 0
                  ?
                  <h5 className='text-primary'>Haven't Completed Any Projects</h5>
                  :
                  currentItems.map((project) => <Project key={project.Project.id} project={project.Project} rating={project.rating} />)
            }
         </div>
         {
            Projects.length
               ?
               <Paginator first={first} rows={2} totalRecords={Projects.length} onPageChange={onPageChange} />
               :
               null
         }
      </div>
   )
}
