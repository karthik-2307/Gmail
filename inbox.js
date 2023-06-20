document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector("#compose-form").addEventListener("submit",send_email)
  // By default, load the inbox
  load_mailbox('inbox');
});
function view_email(id)
{
  // console.log("hii");
  // console.log(id);
  fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {
    // Print email
    // console.log(email);
    // console.log("HII");
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-detail-view').style.display = 'block';
    document.querySelector('#emails-detail-view').innerHTML=`
    <ul class="list-group">
    <li class="list-group-item"><strong>From:</strong>${email.sender}</li>
    <li class="list-group-item"><strong>To:</strong>${email.recipients}</li>
    <li class="list-group-item"><strong>Subject:</strong>${email.subject}</li>
    <li class="list-group-item"><strong>Time stamp :</strong>${email.timestamp}</li>
    <li class="list-group-item"><strong></strong>${email.body}</li>
    </ul>
`;
if(!email.read)
{
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}
const arc = document.createElement('button');
arc.innerHTML=email.archived ? "Unarchive":"Archive";
arc.className=email.archived? "btn btn-danger":"btn btn-success";
arc.addEventListener('click', function() {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !email.archived
    })
  })
  .then(()=>{load_mailbox('archive')});
});
document.querySelector('#emails-detail-view').append(arc);
const reply = document.createElement('button');
reply.innerHTML="Reply";
reply.className="btn btn-info";
    // ... do something else with email ...
    reply.addEventListener('click', function() {
      console.log("Reply")
      compose_email();
      document.querySelector('#compose-recipients').value =email.sender;
      let subject=email.subject;
      if(subject.split(' ',1)[0]!="Re!")
      {
        subject="Re :"+subject;
      }
      document.querySelector('#compose-subject').value =subject;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote ${email.body}`;
    });
    document.querySelector('#emails-detail-view').append(reply);
});
}
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-detail-view').style.display = 'none';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  // document.querySelector('#emails-detail-view').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-detail-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  //Get the emails from mailbox and users
  // fetch('/emails/${mailbox}')
  fetch(`/emails/${mailbox}`)
  // fetch('/emails/inbox') 

.then(response => response.json())
.then(emails => {
    // Print emails
    emails.forEach(singleEmail => {
      const element = document.createElement('div');
      element.className="list-group-item";
      element.id='border';
      element.innerHTML = `
      <h5>Sender:${singleEmail.sender}</h5>
      <h6>Subject:${singleEmail.subject}</h6>
      <p>${singleEmail.timestamp}</p>
      `;
      // element.className=singleEmail.read ? 'read':'unread';
      if(singleEmail.read )
      {
        // element.className='read';
        element.id='read';
      }
      else
      {
        // element.className='unread';
        element.id='unread';
      }
document.querySelector('#emails-view').append(element);
element.addEventListener('click',function(){view_email(singleEmail.id)});
    });
    console.log(emails);
    // ... do something else with emails ...
});
}
function send_email(event)
{
  // Event.preventDefault();
  event.preventDefault();
  // console.log("Email sent");
  const recipients=document.querySelector('#compose-recipients').value;
  const subject=document.querySelector('#compose-subject').value ;
  const body=document.querySelector('#compose-body').value ;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients:recipients,
        subject:subject,
        body:body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result)
      // console
      load_mailbox('sent')
  });
}
