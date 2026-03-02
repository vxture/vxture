/**
 * 使用示例：展示如何在组件中使用 useContent Hook
 *
 * 这个文件展示了各种使用场景和最佳实践
 */

'use client';

import { useContent } from '@/application/hooks/useContent';
import { contentService } from '@/infrastructure/adapters/content/contentService';
import type { FeaturesContent } from '@/shared/types/content.types';

// ============================================================================
// 示例 1: 基础使用（自动类型推断）
// ============================================================================

export function HeroSection() {
  // ✅ data 的类型会自动推断为 HeroContent
  const { data, isLoading, isError } = useContent('hero');

  if (isLoading) {
    return <div className='animate-pulse'>Loading hero section...</div>;
  }

  if (isError || !data) {
    return <div className='text-red-500'>Failed to load hero section</div>;
  }

  // TypeScript 会自动提供类型提示
  return (
    <section className='hero'>
      <h1>
        {data.title} <span className='highlight'>{data.titleHighlight}</span>
      </h1>
      <p>{data.description}</p>
      {data.cta && (
        <a href={data.cta.href} className='btn btn-primary'>
          {data.cta.label}
        </a>
      )}
    </section>
  );
}

// ============================================================================
// 示例 2: 显式类型指定
// ============================================================================

export function FeaturesSection() {
  // 显式指定类型（可选，但有时更清晰）
  const { data, isLoading, isError } = useContent<FeaturesContent>('features');

  if (isLoading) return <FeaturesSkeleton />;
  if (isError || !data) return <ErrorFallback />;

  return (
    <section className='features'>
      <h2>{data.title}</h2>
      <p className='subtitle'>{data.subtitle}</p>

      <div className='features-grid'>
        {data.items.map((item) => (
          <div key={item.id} className='feature-card'>
            <h3>{item.title}</h3>
            <p>{item.subtitle}</p>
            {item.description && <p className='description'>{item.description}</p>}
            <ul className='highlights'>
              {item.highlights.map((highlight, idx) => (
                <li key={idx}>{highlight}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// 示例 3: 使用 contentService 进行数据处理
// ============================================================================

export function SolutionsSection() {
  const { data, isLoading } = useContent('solutions');

  if (isLoading || !data) return null;

  // 使用 contentService 过滤和搜索
  const itemCount = contentService.getItemCount(data);

  return (
    <section className='solutions'>
      <h2>{data.title}</h2>
      <p className='subtitle'>{data.subtitle}</p>
      <p className='count'>共 {itemCount} 个解决方案</p>

      <div className='solutions-grid'>
        {data.items.map((item) => (
          <div key={item.id} className='solution-card'>
            {/* 使用 Next.js Image 组件优化图片加载 */}
            {/* <Image src={item.cover.url} alt={item.cover.alt} width={400} height={300} /> */}
            <img src={item.cover.url} alt={item.cover.alt} />
            <h3>{item.title}</h3>
            <p>{item.subtitle}</p>
            <div className='tags'>
              {item.tags.map((tag) => (
                <span key={tag} className='tag'>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// 示例 4: 条件加载和错误处理
// ============================================================================

export function ConditionalContent({ showFeatures }: { showFeatures: boolean }) {
  const { data, isLoading, isError, error, refetch } = useContent('features', {
    enabled: showFeatures, // 只在 showFeatures 为 true 时加载
    retry: 3, // 失败后重试 3 次
    retryDelay: 2000, // 每次重试延迟 2 秒
  });

  if (!showFeatures) {
    return null;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div className='error'>
        <p>Error: {error?.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return <div>{/* Render content */}</div>;
}

// ============================================================================
// 示例 5: 服务端预加载（配合 Next.js）
// ============================================================================

/**
 * 在服务端组件中预加载数据
 * 这样可以实现 SSR 和更好的 SEO
 */
export async function ServerSideHero({ locale }: { locale: string }) {
  try {
    // 直接使用 contentService 在服务端获取数据
    const hero = await contentService.getEnabledContent('hero', locale);

    if (!hero) {
      return <div>Hero section is disabled</div>;
    }

    return (
      <section className='hero'>
        <h1>
          {hero.title} <span>{hero.titleHighlight}</span>
        </h1>
        <p>{hero.description}</p>
      </section>
    );
  } catch (error) {
    console.error('Failed to load hero:', error);
    return <div>Failed to load hero section</div>;
  }
}

// ============================================================================
// 示例 6: 搜索和过滤
// ============================================================================

export function SearchableSolutions() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTags] = React.useState<string[]>([]);

  const { data, isLoading } = useContent('solutions');

  if (isLoading || !data) return null;

  // 应用搜索过滤
  let filteredData = data;

  if (searchQuery) {
    filteredData = contentService.searchItems(filteredData, searchQuery);
  }

  if (selectedTags.length > 0) {
    filteredData = contentService.filterByTags(filteredData, selectedTags);
  }

  return (
    <div>
      <input
        type='text'
        placeholder='Search solutions...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className='solutions-grid'>
        {filteredData.items.map((item) => (
          <div key={item.id}>{item.title}</div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 辅助组件
// ============================================================================

function FeaturesSkeleton() {
  return (
    <div className='animate-pulse'>
      <div className='h-8 bg-gray-200 rounded w-1/3 mb-4'></div>
      <div className='h-4 bg-gray-200 rounded w-2/3 mb-8'></div>
      <div className='grid grid-cols-3 gap-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='h-48 bg-gray-200 rounded'></div>
        ))}
      </div>
    </div>
  );
}

function ErrorFallback() {
  return (
    <div className='text-center py-12'>
      <p className='text-red-500'>Failed to load content</p>
      <button onClick={() => window.location.reload()} className='mt-4'>
        Reload Page
      </button>
    </div>
  );
}

// ============================================================================
// 高级示例：缓存管理
// ============================================================================

export function CacheManager() {
  const handleClearCache = () => {
    contentService.clearAllCache();
    alert('Cache cleared!');
  };

  const handleWarmupCache = async () => {
    await contentService.warmupCache('zh-CN');
    alert('Cache warmed up!');
  };

  return (
    <div className='cache-manager'>
      <button onClick={handleClearCache}>Clear Cache</button>
      <button onClick={handleWarmupCache}>Warmup Cache</button>
    </div>
  );
}

// ============================================================================
// 导出示例
// ============================================================================

// 注意：这个文件仅用于演示，实际使用时应根据需要拆分到不同的组件文件中
import React from 'react';
