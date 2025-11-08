if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Uso: python alignment_visualizer.py 'nome agente' 'domínio'")
        sys.exit(1)
    
    name = sys.argv[1]
    domain = sys.argv[2]
    
    print(f"\n{'='*70}")
    print(f"🔍 ANÁLISE DE ALINHAMENTO SEMÂNTICO")
    print(f"{'='*70}\n")
    
    report = generate_alignment_report(name, domain)
    
    print(f"Agente: {report['agent_name']}")
    print(f"Domínio: {report['domain'][:60]}...")
    print(f"\nSemantic Density (SD): {report['overall_sd']:.3f}")
    print(f"Cosine Similarity: {report['cosine_similarity']:.3f}")
    print(f"Palavras: {report['word_count']}\n")
    
    print(f"{'='*70}")
    print(f"📊 ALINHAMENTO POR TERMO DO DOMÍNIO")
    print(f"{'='*70}\n")
    
    for keyword in report['keywords']:
        # Barra de progresso visual
        bar_length = int(keyword['alignment'] * 30)
        bar = '█' * bar_length + '░' * (30 - bar_length)
        
        print(f"{keyword['word']:<20} {bar} {keyword['alignment']:.3f}")
        print(f"{'':20} Tipo: {keyword['type']} | Contribuição: {keyword['contribution']:.3f}\n")
    
    print(f"{'='*70}")
    print(f"💡 INSIGHTS")
    print(f"{'='*70}\n")
    
    if report['top_contributors']:
        print(f"✅ Top Contributors (alta afinidade):")
        for tc in report['top_contributors']:
            print(f"   • {tc}")
        print()
    
    if report['weak_links']:
        print(f"⚠️ Weak Links (baixa afinidade):")
        for wl in report['weak_links']:
            print(f"   • {wl}")
        print()
    
    print(f"📋 Recomendações:")
    for rec in report['recommendations']:
        print(f"   {rec}")
    
    print(f"\n{'='*70}\n")
