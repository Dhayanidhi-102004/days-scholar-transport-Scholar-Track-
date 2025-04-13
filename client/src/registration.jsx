import img1 from './images/Bannari.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import { useState } from 'react';
import axios from 'axios'
import { useParams,useNavigate } from 'react-router-dom';
const registration = () => {
const [name, setName] = useState('');
const [rollno, setRollno] = useState('');
const [degree, setDegree] = useState('');
const [dept, setDept] = useState('');
const [year, setYear] = useState('');
const [gender, setGender] = useState('');
const [email, setEmail] = useState('');
const [dob, setDob] = useState('');
const [address, setAddress] = useState('');
const [phoneno, setPhoneno] = useState('');
const [parentno, setParentno] = useState('');
  const navigate=useNavigate()
  const { email: paramEmail } = useParams(); 

  useState(() => {
    if (paramEmail) {
      setEmail(paramEmail);
    }
  }, [paramEmail]);
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3009/register', {
      name, rollno, degree, dept, year, gender, email, dob, address, phoneno,parentno
    })
    .then(result => {
      console.log(result);
      navigate(`/bus_booking/${email}`, { state: { email } });  // Pass the email in the URL
    })
    .catch(err => console.log(err));
  };
  return (
    <>
    <div className="container mt-5">
    <div className="image d-flex justify-content-center align-items-center">
  <img id="img1" src={img1} alt="Bannari Logo" />
</div>

      <h1 className='text-center'>STUDENTS DETAIL REGISTRATION </h1>
      <form onSubmit={handleSubmit}>
      <div className="input-group mb-3">
        <label className='input-group-text'>Name</label>
          <input type='text' className="form-control" placeholder='' required 
          onChange={(e)=>setName(e.target.value)}/>
        </div>
        
        <div className="input-group mb-3">
        <label className='input-group-text'>Roll No</label>
          <input type='text' className="form-control" placeholder='' required 
          onChange={(e)=>setRollno(e.target.value)}/>
        </div>
        <div className="input-group mb-3">
  <label className='input-group-text'>Degree</label>
  <select className='form-select' onChange={(e)=>setDegree(e.target.value)}>
    <option value="">Choose...</option>
    <option value="BE">BE</option>
    <option value="B.Tech">B.Tech</option>
    </select >
    </div>
        <div className="input-group mb-3">
  <label className='input-group-text'>Department</label>
  <select className='form-select' onChange={(e)=>setDept(e.target.value)}>
    <option value="">Choose...</option>
    <option value="Aeronautical Engineering">Aeronautical Engineering</option>
    <option value="Agricultural Engineering">Agricultural Engineering</option>
    <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
    <option value="Artificial Intelligence and Machine Learning">Artificial Intelligence and Machine Learning</option>
    <option value="Automobile Engineering">Automobile Engineering</option>
    <option value="Biomedical Engineering">Biomedical Engineering</option>
    <option value="Chemistry">Chemistry</option>
    <option value="Civil Engineering">Civil Engineering</option>
    <option value="Computer Science and Design">Computer Science and Design</option>
    <option value="Computer Science and Engineering">Computer Science and Engineering</option>
    <option value="Computer Technology">Computer Technology</option>
    <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
    <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
    <option value="Electronics and Instrumentation Engineering">Electronics and Instrumentation Engineering</option>
    <option value="Fashion Technology">Fashion Technology</option>
    <option value="Food Technology">Food Technology</option>
    <option value="Information Science and Engineering">Information Science and Engineering</option>
    <option value="Information Technology">Information Technology</option>
    <option value="Mechanical Engineering">Mechanical Engineering</option>
    <option value="Mechatronics Engineering">Mechatronics Engineering</option>
    <option value="Textile Technology">Textile Technology</option>
  </select>
</div>
<div className="input-group mb-3">
  <label className='input-group-text'>Year Of Study</label>
  <select className='form-select' onChange={(e)=>setYear(e.target.value)}>
    <option value="">Choose...</option>
    <option value="I">I</option>
    <option value="II">II</option>
    <option value="III">III</option>
    <option value="IV">IV</option>
    </select>
    </div>
    <div className="mb-3 d-flex">
  <label className="input-group-text">Gender</label>
  <div className="form-check">
    <input className="form-check-input ms-5" type="radio" name="gender" id="male" value="male" onChange={(e) => setGender(e.target.value)} />
    <label className="form-check-label" htmlFor="male">Male</label>
  </div>
  <div className="form-check">
    <input className="form-check-input ms-5" type="radio" name="gender" id="female" value="female" onChange={(e) => setGender(e.target.value)} />
    <label className="form-check-label" htmlFor="female">Female</label>
  </div>
</div>

<div className="input-group mb-3">
          <label className='input-group-text'>E-Mail</label>
          <input
            type='text'
            value={email || ''} // Controlled input
            className="form-control"
            placeholder=''
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group mb-3">
        <label className='input-group-text'>D.O.B</label>
          <input type='date' className="form-control" placeholder='' required 
          onChange={(e)=>setDob(e.target.value)}/>
        </div>
        <div className="input-group mb-3">
        <label className='input-group-text'>Address</label>
          <input type='text' className="form-control" placeholder='' required 
          onChange={(e)=>setAddress(e.target.value)}/>
        </div>
        <div className="input-group mb-3">
        <label className='input-group-text'>Phone No</label>
          <input type='number' className="form-control" placeholder='' required 
          onChange={(e)=>setPhoneno(e.target.value)}/>
        </div>
        <div className="input-group mb-3">
        <label className='input-group-text'>Parent No</label>
          <input type='number' className="form-control" placeholder='' required 
          onChange={(e)=>setParentno(e.target.value)}/>
        </div>
        
        <button type="submit" className="btn btn-primary d-flex justify-content-center align-items-center">
  Next
</button>

    
    </form></div>
    </>
  )
}

export default registration