import Link from 'next/link'
import { Inbox, Send, File, Trash2, AlertCircle, Settings } from 'lucide-react'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.logo}>
        <h2>PhoneMail</h2>
      </div>
      
      <nav className={styles.nav}>
        <Link href="/" className={`${styles.navItem} ${styles.active}`}>
          <Inbox size={18} />
          <span>Inbox</span>
        </Link>
        <Link href="/" className={styles.navItem}>
          <Send size={18} />
          <span>Sent</span>
        </Link>
        <Link href="/" className={styles.navItem}>
          <File size={18} />
          <span>Drafts</span>
        </Link>
        <div className={styles.divider}></div>
        <Link href="/" className={styles.navItem}>
          <AlertCircle size={18} />
          <span>Spam</span>
        </Link>
        <Link href="/" className={styles.navItem}>
          <Trash2 size={18} />
          <span>Trash</span>
        </Link>
      </nav>
      
      <div className={styles.footer}>
        <Link href="/" className={styles.navItem}>
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  )
}
