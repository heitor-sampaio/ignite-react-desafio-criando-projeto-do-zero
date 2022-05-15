/* eslint-disable testing-library/no-await-sync-query */
import { GetStaticProps } from 'next';
import Head from 'next/head';

import {getPrismicClient} from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Header from '../components/Header';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi'
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const loadedPosts = postsPagination.results.map(post => (post))

    setPosts(loadedPosts)
  }, [])

  async function loadMorePosts() {
    const newPosts = await fetch(postsPagination.next_page).then(response => response.json().then(data => (data.results)))

    newPosts.map(post => setPosts([...posts, post]))
  }

  return (
    <>
      <Head>

        <title>spacetraveling</title>
        <Header />
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <span>{post.data.subtitle}</span>
                <div>
                  <time><FiCalendar />{post.first_publication_date}</time>
                  <span><FiUser />{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {postsPagination.next_page && (<button className={styles.loadMorePosts} onClick={loadMorePosts}><strong>Carregar mais posts</strong></button>)}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.getByType('post', {
    pageSize: 2,
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(
      post => {
        return {
          ...post,
          first_publication_date: post.first_publication_date = format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR})}
      }
    )
  }

  return {
    props: { postsPagination },
    revalidate: 60 * 30, // 30 minutes
  };
};
