import { asHTML, asText } from '@prismicio/helpers';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import {getPrismicClient} from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter} from 'next/router';
import { read } from 'fs';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[]
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {
  const router = useRouter();

  const postFormated = {
    ...post,
    data: {
      ...post.data,
      content: post.data.content.map(section => (
        {
          heading: section.heading,
          body: {text: asHTML(section.body)}         
        }
      ))
    },
    first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR })
  }

  const postWords = post.data.content.reduce((postWordsCount, section) => {
    const sectionWords = asText(section.body).split(' ').length

    return postWordsCount += sectionWords
  }, 0)

  const readingTimeInMinutes = Math.ceil(postWords / 200);

  if (router.isFallback) {
    return <div>Carregando...</div>
  } else {
    return (
      <>
        <Header />
        <main className={styles.container}>
          <article className={styles.post}>
            <img src={postFormated.data.banner.url}/>
            <h1>{postFormated.data.title}</h1>
            <div>
              <time><FiCalendar/>{postFormated.first_publication_date}</time>
              <span><FiUser/>{postFormated.data.author}</span>
              <span><FiClock/>{`${readingTimeInMinutes} min`}</span>
            </div>
            {postFormated.data.content.map(section => (
              <div key={section.heading} className={styles.postSection}>
                <h2>{section.heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: section.body.text}}/>              
              </div>
            ))}
          </article>
        </main>
      </>
    )
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.getByType('post', { pageSize: 5});

  const slugs = response.results.map(post => (
    { params: { slug: post.uid }}
  ))

  return {
    paths: slugs,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params

  const response = await prismic.getByUID('post', String(slug));

  return {
    props: { post: response },
    revalidate: 60 * 60 * 24 //  24 horas
  }
};
