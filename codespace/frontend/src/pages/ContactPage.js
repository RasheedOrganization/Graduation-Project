import React from 'react';
import NavBar from '../components/NavBar';
import '../styles/ContactPage.css';

function ContactPage() {
  return (
    <div className="contact-container">
      <NavBar />
      <main className="contact-content">
        <h1>Contact Us</h1>
        <p>
          Have questions or feedback? We'd love to hear from you. Reach out
          using the information below or send us a message.
        </p>
        <section className="contact-info">
          <p>
            <strong>Email:</strong> support@example.com
          </p>
          <p>
            <strong>Phone:</strong> +1 (555) 123-4567
          </p>
          <p>
            <strong>Address:</strong> 1234 Code Hub Lane, Algorithm City, 56789
          </p>
        </section>
        <form className="contact-form">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" placeholder="Your Name" />

          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Your Email" />

          <label htmlFor="message">Message</label>
          <textarea id="message" rows="5" placeholder="Your Message" />

          <button type="submit">Send Message</button>
        </form>
      </main>
    </div>
  );
}

export default ContactPage;
