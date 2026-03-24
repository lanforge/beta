import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicyPage: React.FC = () => {
  const [content, setContent] = useState({ title: 'Privacy Policy', content: '<p>Loading...</p>' });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/pages/privacy-policy`)
      .then(res => res.json())
      .then(data => {
        if (data.page) setContent(data.page);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <section className="relative overflow-hidden py-10 md:py-16">
        <div className="absolute inset-0 bg-gradient-radial from-emerald-400/10 via-transparent to-transparent" />
        <div className="container-narrow relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="heading-1 mb-6">{content.title}</h1>
            <div className="prose prose-invert max-w-none text-left text-gray-300" dangerouslySetInnerHTML={{ __html: content.content }} />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
